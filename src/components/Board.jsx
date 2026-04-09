import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { animateSection } from '../lib/gsapAnimations'
import styles from './Board.module.scss'

const emptyForm = {
    title: '',
    author: '',
    content: '',
    password: '',
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

function apiUrl(path) {
    return `${API_BASE_URL}${path}`
}

async function requestJson(path, options) {
    let response
    const requestUrl = /^https?:\/\//.test(path) ? path : apiUrl(path)

    try {
        response = await fetch(requestUrl, options)
    } catch {
        throw new Error('게시판 서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.')
    }

    const payload = await response.json().catch(() => null)
    return { response, payload }
}

function getStoredAdminKey() {
    return sessionStorage.getItem('boardAdminKey') ?? ''
}

function clearStoredAdminKey() {
    sessionStorage.removeItem('boardAdminKey')
}

function formatDate(value) {
    return new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value))
}

export default function Board() {
    const ref = useRef(null)
    const [posts, setPosts] = useState([])
    const [selectedId, setSelectedId] = useState(null)
    const [form, setForm] = useState(emptyForm)
    const [mode, setMode] = useState('create')
    const [modalOpen, setModalOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [isAdmin, setIsAdmin] = useState(() => Boolean(getStoredAdminKey()))

    const selectedPost = useMemo(
        () => posts.find((post) => post.id === selectedId) ?? null,
        [posts, selectedId]
    )

    useLayoutEffect(() => {
        return animateSection(
            ref.current,
            [
                `.${styles['board__label']}`,
                `.${styles['board__heading']}`,
                `.${styles['board__panel']}`,
            ],
            {
                start: 'top 84%',
                end: 'top 38%',
                stagger: 0.1,
                scrub: true,
                y: 42,
                followSelector: '[data-section-inner]',
                followY: 6,
            }
        )
    }, [])

    useEffect(() => {
        const loadPosts = async () => {
            setLoading(true)
            setError('')

            try {
                const { response, payload } = await requestJson('/api/posts')

                if (response.status === 503) {
                    setPosts([])
                    setSelectedId(null)
                    setError(payload?.message ?? '게시판 서버를 일시적으로 사용할 수 없습니다.')
                    return
                }

                if (!response.ok) {
                    throw new Error('게시글을 불러오지 못했습니다.')
                }

                const data = payload ?? []
                setPosts(data)
                setSelectedId((current) => current ?? data[0]?.id ?? null)
            } catch (loadError) {
                setError(loadError.message)
            } finally {
                setLoading(false)
            }
        }

        loadPosts()
    }, [])

    useEffect(() => {
        const verifyAdmin = async () => {
            const key = getStoredAdminKey()
            if (!key) return

            const { response } = await requestJson('/api/admin/verify', {
                headers: {
                    'x-admin-key': key,
                },
            })

            if (!response.ok) {
                clearStoredAdminKey()
                setIsAdmin(false)
            }
        }

        verifyAdmin()
    }, [])

    useEffect(() => {
        if (!modalOpen) return undefined

        const onKeyDown = (event) => {
            if (event.key === 'Escape') {
                setModalOpen(false)
            }
        }

        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        window.addEventListener('keydown', onKeyDown)

        return () => {
            document.body.style.overflow = previousOverflow
            window.removeEventListener('keydown', onKeyDown)
        }
    }, [modalOpen])

    const handleChange = (event) => {
        const { name, value } = event.target
        setForm((current) => ({ ...current, [name]: value }))
    }

    const handleSelectPost = (post) => {
        setSelectedId(post.id)
        setMode('view')
        setForm({
            title: post.title,
            author: post.author,
            content: post.content,
            password: '',
        })
        setMessage('')
        setModalOpen(true)
    }

    const handleCreateMode = () => {
        setMode('create')
        setSelectedId(null)
        setForm(emptyForm)
        setMessage('새 글 작성 모드입니다.')
        setModalOpen(true)
    }

    const handleEditMode = () => {
        if (!selectedPost) return

        setMode('edit')
        setForm({
            title: selectedPost.title,
            author: selectedPost.author,
            content: selectedPost.content,
            password: '',
        })
        setMessage('게시글 수정 모드입니다.')
        setModalOpen(true)
    }

    const refreshPosts = async (nextSelectedId) => {
        const { response, payload } = await requestJson('/api/posts')

        if (response.status === 503) {
            setPosts([])
            setSelectedId(null)
            throw new Error(payload?.message ?? '게시판 서버를 일시적으로 사용할 수 없습니다.')
        }

        if (!response.ok) {
            throw new Error('게시글 목록을 갱신하지 못했습니다.')
        }

        const data = payload ?? []
        setPosts(data)
        setSelectedId(nextSelectedId ?? data[0]?.id ?? null)
        return data
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setSubmitting(true)
        setError('')
        setMessage('')

        try {
            const path =
                mode === 'edit' && selectedPost ? `/api/posts/${selectedPost.id}` : '/api/posts'
            const method = mode === 'edit' && selectedPost ? 'PUT' : 'POST'

            const { response, payload } = await requestJson(path, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-key': getStoredAdminKey(),
                },
                body: JSON.stringify(form),
            })

            if (!response.ok) {
                if (response.status === 403) {
                    clearStoredAdminKey()
                    setIsAdmin(false)
                }
                throw new Error(payload?.message ?? '요청에 실패했습니다.')
            }

            const selectedPostId = method === 'POST' ? payload.id : selectedPost?.id
            await refreshPosts(selectedPostId)
            setMode('view')
            setModalOpen(false)
            setMessage(method === 'POST' ? '게시글이 등록되었습니다.' : '게시글이 수정되었습니다.')

            if (method === 'POST') {
                setForm(emptyForm)
            }
        } catch (submitError) {
            setError(submitError.message)
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!selectedPost) return

        const password = window.prompt(
            '삭제 비밀번호를 입력해주세요.\n비밀번호 없이 등록한 기존 글은 비워둔 채 확인해도 됩니다.'
        )

        if (password === null) {
            return
        }

        setSubmitting(true)
        setError('')
        setMessage('')

        try {
            const { response, payload } = await requestJson(`/api/posts/${selectedPost.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-key': getStoredAdminKey(),
                },
                body: JSON.stringify({ password }),
            })

            if (!response.ok) {
                if (response.status === 403) {
                    clearStoredAdminKey()
                    setIsAdmin(false)
                }
                throw new Error(payload?.message ?? '삭제에 실패했습니다.')
            }

            const nextPosts = await refreshPosts(null)
            setMode('create')
            setForm(emptyForm)
            setSelectedId(nextPosts[0]?.id ?? null)
            setModalOpen(false)
            setMessage('게시글이 삭제되었습니다.')
        } catch (deleteError) {
            setError(deleteError.message)
        } finally {
            setSubmitting(false)
        }
    }

    const closeModal = () => {
        setModalOpen(false)

        if (!selectedPost) {
            setMode('create')
            setForm(emptyForm)
        }
    }

    const handleAdminToggle = () => {
        if (isAdmin) {
            clearStoredAdminKey()
            setIsAdmin(false)
            return
        }

        const promptAdmin = async () => {
            const key = window.prompt('관리자 비밀번호를 입력하세요.')
            if (!key) return

            const { response } = await requestJson('/api/admin/verify', {
                headers: {
                    'x-admin-key': key,
                },
            })

            if (!response.ok) {
                setError('관리자 비밀번호가 올바르지 않습니다.')
                clearStoredAdminKey()
                setIsAdmin(false)
                return
            }

            sessionStorage.setItem('boardAdminKey', key)
            setIsAdmin(true)
            setError('')
        }

        promptAdmin()
    }

    return (
        <section id="board" className={styles.board}>
            <div className={styles['board__inner']} ref={ref} data-section-inner>
                <div className={styles['board__label']}>
                    <span className={styles['board__num']}>05</span>
                    <span>board</span>
                </div>

                <div className={styles['board__hero']}>
                    <h2 className={styles['board__heading']}>공지사항</h2>
                </div>

                <div className={styles['board__panel']}>
                    <div className={styles['board__toolbar']}>
                        <p className={styles['board__meta']}>
                            {loading ? '불러오는 중...' : `총 ${posts.length}개의 게시글`}
                        </p>
                        <button
                            type="button"
                            className={styles['board__admin-toggle']}
                            onClick={handleAdminToggle}
                            title={isAdmin ? '관리자 모드 해제' : '관리자 모드'}
                        >
                            {isAdmin ? '🔓' : '🔒'}
                        </button>
                    </div>

                    {isAdmin ? (
                        <div className={styles['board__create-row']}>
                            <button
                                type="button"
                                className={styles['board__ghost-button']}
                                onClick={handleCreateMode}
                            >
                                새 글 작성
                            </button>
                        </div>
                    ) : null}

                    {message ? <p className={styles['board__message']}>{message}</p> : null}
                    {error ? <p className={styles['board__error']}>{error}</p> : null}

                    {!loading && posts.length === 0 ? (
                        <div className={styles['board__empty-block']}>
                            <p className={styles['board__empty']}>
                                아직 등록된 메모가 없습니다.
                                <br />새 글 작성 버튼으로 첫 기록을 남겨보세요.
                            </p>
                        </div>
                    ) : (
                        <div className={styles['board__list-wrap']}>
                            <div className={styles['board__list']}>
                                {posts.map((post) => (
                                    <button
                                        key={post.id}
                                        type="button"
                                        className={`${styles['board__list-item']} ${selectedId === post.id ? styles['board__list-item--active'] : ''}`}
                                        onClick={() => handleSelectPost(post)}
                                    >
                                        <div className={styles['board__list-main']}>
                                            <p className={styles['board__list-title']}>
                                                {post.title}
                                            </p>
                                            <p className={styles['board__list-sub']}>
                                                {post.author} · {formatDate(post.createdAt)}
                                            </p>
                                        </div>
                                        <span className={styles['board__list-arrow']}>↗</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {modalOpen
                    ? createPortal(
                          <div className={styles['board__modal']} onClick={closeModal}>
                              <div
                                  className={styles['board__modal-card']}
                                  onClick={(event) => event.stopPropagation()}
                              >
                                  <div className={styles['board__panel-head']}>
                                      <h3 className={styles['board__panel-title']}>
                                          {mode === 'edit' ? '글 수정' : ''}
                                      </h3>

                                      <div className={styles['board__actions']}>
                                          {selectedPost && mode === 'view' && isAdmin ? (
                                              <>
                                                  <button
                                                      type="button"
                                                      className={styles['board__ghost-button']}
                                                      onClick={handleEditMode}
                                                  >
                                                      수정
                                                  </button>
                                                  <button
                                                      type="button"
                                                      className={`${styles['board__ghost-button']} ${styles['board__ghost-button--danger']}`}
                                                      onClick={handleDelete}
                                                      disabled={submitting}
                                                  >
                                                      삭제
                                                  </button>
                                              </>
                                          ) : null}

                                          <button
                                              type="button"
                                              className={styles['board__ghost-button']}
                                              onClick={closeModal}
                                          >
                                              닫기
                                          </button>
                                      </div>
                                  </div>

                                  {mode === 'view' && selectedPost ? (
                                      <article className={styles['board__detail']}>
                                          <h4 className={styles['board__detail-title']}>
                                              {selectedPost.title || '테스트 제목'}
                                          </h4>
                                          <div className={styles['board__detail-meta']}>
                                              <span>{selectedPost.author}</span>
                                              <span>{formatDate(selectedPost.updatedAt)}</span>
                                          </div>
                                          <p className={styles['board__detail-body']}>
                                              {selectedPost.content}
                                          </p>
                                      </article>
                                  ) : (
                                      <form
                                          className={styles['board__form']}
                                          onSubmit={handleSubmit}
                                      >
                                          <label className={styles['board__field']}>
                                              <span>제목</span>
                                              <input
                                                  name="title"
                                                  value={form.title}
                                                  onChange={handleChange}
                                                  className={styles['board__input']}
                                                  placeholder="제목을 입력하세요"
                                                  required
                                              />
                                          </label>

                                          <label className={styles['board__field']}>
                                              <span>작성자</span>
                                              <input
                                                  name="author"
                                                  value={form.author}
                                                  onChange={handleChange}
                                                  className={styles['board__input']}
                                                  placeholder="작성자 이름"
                                              />
                                          </label>

                                          <label className={styles['board__field']}>
                                              <span>내용</span>
                                              <textarea
                                                  name="content"
                                                  value={form.content}
                                                  onChange={handleChange}
                                                  className={`${styles['board__input']} ${styles['board__textarea']}`}
                                                  placeholder="게시글 내용을 입력하세요"
                                                  required
                                              />
                                          </label>

                                          <label className={styles['board__field']}>
                                              <span>
                                                  {mode === 'edit' ? '비밀번호 확인' : '비밀번호'}
                                              </span>
                                              <input
                                                  type="password"
                                                  name="password"
                                                  value={form.password}
                                                  onChange={handleChange}
                                                  className={styles['board__input']}
                                                  placeholder={
                                                      mode === 'edit'
                                                          ? '수정 권한 확인용 비밀번호'
                                                          : '4자 이상 입력하세요'
                                                  }
                                                  minLength={4}
                                                  required
                                              />
                                          </label>

                                          <div className={styles['board__actions']}>
                                              <button
                                                  type="button"
                                                  className={styles['board__ghost-button']}
                                                  onClick={closeModal}
                                              >
                                                  취소
                                              </button>
                                              <button
                                                  type="submit"
                                                  className={styles['board__submit']}
                                                  disabled={submitting}
                                              >
                                                  {submitting
                                                      ? '저장 중...'
                                                      : mode === 'edit'
                                                        ? '수정 완료'
                                                        : '글 등록'}
                                              </button>
                                          </div>
                                      </form>
                                  )}
                              </div>
                          </div>,
                          document.body
                      )
                    : null}
            </div>
        </section>
    )
}
