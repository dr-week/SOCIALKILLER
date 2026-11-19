const failureStatuses = Object.freeze({
  skipped_duplicate_token: { httpStatus: 409, message: 'This post request was already processed.' },
  rejected_approval_required: { httpStatus: 409, message: 'Human approval is required before browser dispatch.' },
  rejected_quality_guard: { httpStatus: 422, message: 'The post did not pass content checks.' },
  skipped_limit: { httpStatus: 429, message: 'A publishing limit prevented the post from being queued.' }
})

export function postCreationResponse(post) {
  if (typeof post?.id === 'string' && post.id) {
    return { httpStatus: 201, success: true, error: null }
  }

  const failure = failureStatuses[post?.status]
  return {
    httpStatus: failure?.httpStatus || 422,
    success: false,
    error: post?.message || post?.reason || failure?.message || 'Post was not created.'
  }
}
