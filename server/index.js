import cors from 'cors'
import express from 'express'
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const app = express()
const port = Number(process.env.PORT) || 4000
const MIN_PASSWORD_LENGTH = 4
const ADMIN_SECRET = process.env.ADMIN_SECRET
if (!ADMIN_SECRET) {
    console.error('[FATAL] ADMIN_SECRET 환경변수가 설정되지 않았습니다. 서버를 시작할 수 없습니다.')
    process.exit(1)
}

function requireAdmin(req, res, next) {
    if (req.headers['x-admin-key'] === ADMIN_SECRET) return next()
    return res.status(403).json({ message: '관리자 권한이 필요합니다.' })
}
let memoryPosts = []
let memoryNextId = 1

const allowedOrigins = [
    process.env.FRONTEND_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
].filter(Boolean)

function isDatabaseUnavailableError(error) {
    return (
        error?.code === 'P1001' ||
        error?.code === 'P1000' ||
        String(error?.message ?? '').includes('Can\'t reach database server')
    )
}

function isDatabaseSchemaNotReadyError(error) {
    return error?.code === 'P2021' || error?.code === 'P2022'
}

function sanitizePost(post) {
    const { passwordHash: _passwordHash, ...safePost } = post
    return safePost
}

function hashPassword(password, salt = randomBytes(16).toString('hex')) {
    const hash = scryptSync(password, salt, 64).toString('hex')
    return `${salt}:${hash}`
}

function verifyPassword(password, passwordHash) {
    const [salt, storedHash] = (passwordHash ?? '').split(':')

    if (!salt || !storedHash) {
        return false
    }

    const computedHash = scryptSync(password, salt, 64).toString('hex')

    try {
        return timingSafeEqual(Buffer.from(computedHash, 'hex'), Buffer.from(storedHash, 'hex'))
    } catch {
        return false
    }
}

function hasPassword(post) {
    return typeof post?.passwordHash === 'string' && post.passwordHash.includes(':')
}

function sortPostsByCreatedAtDesc(posts) {
    return [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

function findMemoryPostById(postId) {
    return memoryPosts.find((post) => post.id === postId) ?? null
}

app.use(
    cors({
        origin(origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true)
                return
            }

            callback(new Error('CORS_NOT_ALLOWED'))
        },
    })
)
app.use(express.json())

app.get('/api/health', (_req, res) => {
    res.json({ ok: true })
})

app.get('/api/admin/verify', requireAdmin, (_req, res) => {
    res.json({ ok: true })
})

app.get('/api/posts', async (_req, res) => {
    try {
        const posts = await prisma.post.findMany({ orderBy: { createdAt: 'desc' } })
        res.json(posts.map(sanitizePost))
    } catch (error) {
        if (isDatabaseUnavailableError(error)) {
            return res.json(sortPostsByCreatedAtDesc(memoryPosts).map(sanitizePost))
        }

        throw error
    }
})

app.get('/api/posts/:id', async (req, res) => {
    const postId = Number(req.params.id)

    if (Number.isNaN(postId)) {
        return res.status(400).json({ message: '잘못된 게시글 ID입니다.' })
    }

    let post

    try {
        post = await prisma.post.findUnique({ where: { id: postId } })
    } catch (error) {
        if (isDatabaseUnavailableError(error)) {
            post = findMemoryPostById(postId)
        } else {
            throw error
        }
    }

    if (!post) {
        return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' })
    }

    return res.json(sanitizePost(post))
})

app.post('/api/posts', requireAdmin, async (req, res) => {
    const title = req.body.title?.trim()
    const author = req.body.author?.trim() || '익명'
    const content = req.body.content?.trim()
    const password = req.body.password

    if (!title || !content) {
        return res.status(400).json({ message: '제목과 내용을 입력해주세요.' })
    }

    if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
        return res
            .status(400)
            .json({ message: `비밀번호는 ${MIN_PASSWORD_LENGTH}자 이상 입력해주세요.` })
    }

    let post

    try {
        post = await prisma.post.create({
            data: {
                title,
                author,
                content,
                passwordHash: hashPassword(password),
            },
        })
    } catch (error) {
        if (isDatabaseUnavailableError(error)) {
            const now = new Date()
            post = {
                id: memoryNextId++,
                title,
                author,
                content,
                passwordHash: hashPassword(password),
                createdAt: now,
                updatedAt: now,
            }
            memoryPosts.push(post)
        } else {
            throw error
        }
    }

    return res.status(201).json(sanitizePost(post))
})

app.put('/api/posts/:id', requireAdmin, async (req, res) => {
    const postId = Number(req.params.id)

    if (Number.isNaN(postId)) {
        return res.status(400).json({ message: '잘못된 게시글 ID입니다.' })
    }

    const title = req.body.title?.trim()
    const author = req.body.author?.trim() || '익명'
    const content = req.body.content?.trim()
    const password = req.body.password

    if (!title || !content) {
        return res.status(400).json({ message: '제목과 내용을 입력해주세요.' })
    }

    let existingPost

    try {
        existingPost = await prisma.post.findUnique({ where: { id: postId } })
    } catch (error) {
        if (isDatabaseUnavailableError(error)) {
            existingPost = findMemoryPostById(postId)
        } else {
            throw error
        }
    }

    if (!existingPost) {
        return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' })
    }

    const legacyPost = !hasPassword(existingPost)

    if (legacyPost) {
        if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
            return res.status(400).json({
                message: `기존 글 보호를 위해 ${MIN_PASSWORD_LENGTH}자 이상 비밀번호를 새로 설정해주세요.`,
            })
        }
    } else if (typeof password !== 'string' || !verifyPassword(password, existingPost.passwordHash)) {
        return res.status(403).json({ message: '비밀번호가 일치하지 않습니다.' })
    }

    let post

    try {
        post = await prisma.post.update({
            where: { id: postId },
            data: {
                title,
                author,
                content,
                ...(legacyPost ? { passwordHash: hashPassword(password) } : {}),
            },
        })
    } catch (error) {
        if (isDatabaseUnavailableError(error)) {
            const nextPasswordHash = legacyPost ? hashPassword(password) : existingPost.passwordHash
            const updatedPost = {
                ...existingPost,
                title,
                author,
                content,
                passwordHash: nextPasswordHash,
                updatedAt: new Date(),
            }
            memoryPosts = memoryPosts.map((item) => (item.id === postId ? updatedPost : item))
            post = updatedPost
        } else {
            throw error
        }
    }

    return res.json(sanitizePost(post))
})

app.delete('/api/posts/:id', requireAdmin, async (req, res) => {
    const postId = Number(req.params.id)

    if (Number.isNaN(postId)) {
        return res.status(400).json({ message: '잘못된 게시글 ID입니다.' })
    }

    const password = req.body.password

    let existingPost

    try {
        existingPost = await prisma.post.findUnique({ where: { id: postId } })
    } catch (error) {
        if (isDatabaseUnavailableError(error)) {
            existingPost = findMemoryPostById(postId)
        } else {
            throw error
        }
    }

    if (!existingPost) {
        return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' })
    }

    if (hasPassword(existingPost) && (typeof password !== 'string' || !verifyPassword(password, existingPost.passwordHash))) {
        return res.status(403).json({ message: '비밀번호가 일치하지 않습니다.' })
    }

    try {
        await prisma.post.delete({ where: { id: postId } })
    } catch (error) {
        if (isDatabaseUnavailableError(error)) {
            memoryPosts = memoryPosts.filter((post) => post.id !== postId)
        } else {
            throw error
        }
    }

    return res.status(204).send()
})

app.use((error, _req, res, _next) => {
    console.error(error)

    if (error.message === 'CORS_NOT_ALLOWED') {
        return res.status(403).json({ message: '허용되지 않은 출처입니다.' })
    }

    if (error.code === 'P2025') {
        return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' })
    }

    if (isDatabaseSchemaNotReadyError(error)) {
        return res.status(503).json({
            message:
                '게시판 테이블이 준비되지 않았습니다. `npm run db:migrate:deploy` 또는 `npm run db:push` 실행 후 다시 시도해주세요.',
        })
    }

    if (isDatabaseUnavailableError(error)) {
        return res.status(503).json({
            message: '데이터베이스에 연결할 수 없습니다. PostgreSQL 실행 후 다시 시도해주세요.',
        })
    }

    return res.status(500).json({ message: '서버 오류가 발생했습니다.' })
})

app.listen(port, () => {
    console.log(`Board API listening on http://localhost:${port}`)
})