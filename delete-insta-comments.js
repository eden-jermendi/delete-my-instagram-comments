;(async function () {
  const CONFIG = {
    batchSize: 1,
    minShortDelay: 500,
    maxShortDelay: 900,
    minMediumDelay: 1400,
    maxMediumDelay: 2400,
    minLongPause: 25000,
    maxLongPause: 45000,
    pauseEveryMin: 2,
    pauseEveryMax: 4,
    minErrorBackoff: 60000,
    maxErrorBackoff: 120000,
    actionTimeout: 15000,
    logPrefix: '[IG Delete]',
  }

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

  const shortDelay = () => rand(CONFIG.minShortDelay, CONFIG.maxShortDelay)
  const mediumDelay = () => rand(CONFIG.minMediumDelay, CONFIG.maxMediumDelay)
  const longPause = () => rand(CONFIG.minLongPause, CONFIG.maxLongPause)
  const errorBackoff = () =>
    rand(CONFIG.minErrorBackoff, CONFIG.maxErrorBackoff)

  const log = (...args) => console.log(CONFIG.logPrefix, ...args)
  const fail = (...args) => console.error(CONFIG.logPrefix, ...args)

  const normalizeText = (str) => (str || '').replace(/\s+/g, ' ').trim()

  const isVisible = (el) => {
    if (!el || !el.isConnected) return false
    const style = window.getComputedStyle(el)
    if (style.display === 'none' || style.visibility === 'hidden') return false
    if (style.opacity === '0') return false

    const rect = el.getBoundingClientRect()
    return rect.width > 0 && rect.height > 0
  }

  const textOf = (el) => normalizeText(el?.textContent)

  const getClickableAncestor = (el) =>
    el?.closest('button,[role="button"],[tabindex]:not([tabindex="-1"])') ||
    null

  const allCandidates = () =>
    [
      ...document.querySelectorAll(
        'button,[role="button"],[tabindex]:not([tabindex="-1"]),span,div',
      ),
    ].filter(isVisible)

  const findClickableByText = (targetText) => {
    const target = normalizeText(targetText).toLowerCase()

    for (const el of allCandidates()) {
      const text = textOf(el).toLowerCase()
      const aria = normalizeText(el.getAttribute?.('aria-label')).toLowerCase()

      if (text === target || aria === target) {
        const clickable = getClickableAncestor(el) || el
        if (clickable && isVisible(clickable)) return clickable
      }
    }

    return null
  }

  const findAllClickablesByText = (targetText) => {
    const target = normalizeText(targetText).toLowerCase()
    const matches = []

    for (const el of allCandidates()) {
      const text = textOf(el).toLowerCase()
      const aria = normalizeText(el.getAttribute?.('aria-label')).toLowerCase()

      if (text === target || aria === target) {
        const clickable = getClickableAncestor(el) || el
        if (clickable && isVisible(clickable) && !matches.includes(clickable)) {
          matches.push(clickable)
        }
      }
    }

    return matches
  }

  const centerPoint = (el) => {
    const rect = el.getBoundingClientRect()
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    }
  }

  const humanClick = async (el) => {
    if (!el || !isVisible(el)) return false

    el.scrollIntoView({ block: 'center', inline: 'center' })
    await sleep(rand(120, 260))

    const { x, y } = centerPoint(el)
    const pointTarget = document.elementFromPoint(x, y)
    const realTarget =
      getClickableAncestor(pointTarget) || getClickableAncestor(el) || el

    if (!realTarget || !isVisible(realTarget)) return false

    const opts = {
      bubbles: true,
      cancelable: true,
      composed: true,
      clientX: x,
      clientY: y,
      button: 0,
      buttons: 1,
      view: window,
    }

    realTarget.dispatchEvent(new PointerEvent('pointerover', opts))
    realTarget.dispatchEvent(new MouseEvent('mouseover', opts))
    await sleep(rand(40, 90))

    realTarget.dispatchEvent(new PointerEvent('pointerdown', opts))
    realTarget.dispatchEvent(new MouseEvent('mousedown', opts))
    if (typeof realTarget.focus === 'function') realTarget.focus()
    await sleep(rand(60, 120))

    realTarget.dispatchEvent(new PointerEvent('pointerup', opts))
    realTarget.dispatchEvent(new MouseEvent('mouseup', opts))
    realTarget.dispatchEvent(new MouseEvent('click', opts))

    await sleep(rand(150, 260))
    return true
  }

  const waitFor = async (
    fn,
    timeout = CONFIG.actionTimeout,
    interval = 250,
  ) => {
    const start = Date.now()
    while (Date.now() - start < timeout) {
      const result = fn()
      if (result) return result
      await sleep(interval)
    }
    return null
  }

  const getCheckboxes = () =>
    [...document.querySelectorAll('[aria-label="Toggle checkbox"]')].filter(
      isVisible,
    )

  const getSelectedCount = () => {
    const bodyText = document.body.innerText || ''
    const match = bodyText.match(/(\d+)\s+selected/i)
    if (match) return Number(match[1])

    const ariaChecked = [
      ...document.querySelectorAll('[aria-checked="true"]'),
      ...document.querySelectorAll('input[type="checkbox"]:checked'),
    ].filter(isVisible)

    return ariaChecked.length
  }

  const hasErrorBanner = () => {
    const pageText = (document.body.innerText || '').toLowerCase()
    return (
      pageText.includes('something went wrong') ||
      pageText.includes('there was a problem deleting comments') ||
      pageText.includes('try again later')
    )
  }

  const enterSelectModeIfNeeded = async () => {
    let boxes = getCheckboxes()
    if (boxes.length > 0) return boxes

    const selectBtn = findClickableByText('Select')
    if (!selectBtn) throw new Error('Could not find Select button')

    await humanClick(selectBtn)
    await sleep(mediumDelay())

    boxes = await waitFor(() => {
      const current = getCheckboxes()
      return current.length ? current : null
    })

    if (!boxes?.length) throw new Error('Select mode did not expose checkboxes')
    return boxes
  }

  const selectBatch = async () => {
    const boxes = await enterSelectModeIfNeeded()
    const batch = boxes.slice(0, Math.min(CONFIG.batchSize, boxes.length))

    if (!batch.length) return []

    for (const box of batch) {
      await humanClick(box)
      await sleep(shortDelay())
    }

    await sleep(rand(900, 1600))

    const selectedCount = getSelectedCount()
    if (selectedCount < 1) {
      throw new Error('Selection did not register')
    }

    return batch
  }

  const clickDeleteFlow = async () => {
    const firstDelete =
      (await waitFor(() => findClickableByText('Delete'), 9000)) ||
      (await waitFor(() => findClickableByText('Delete comment'), 9000)) ||
      (await waitFor(() => findClickableByText('Delete comments'), 9000))

    if (!firstDelete) throw new Error('Could not find first Delete button')

    await humanClick(firstDelete)

    await sleep(rand(1800, 3200))

    const confirmDelete =
      (await waitFor(() => {
        const matches = [
          ...findAllClickablesByText('Delete comment'),
          ...findAllClickablesByText('Delete comments'),
          ...findAllClickablesByText('Delete'),
        ]
        return matches.length ? matches[matches.length - 1] : null
      }, 12000)) || null

    if (!confirmDelete) {
      throw new Error('Could not find confirmation Delete button')
    }

    await humanClick(confirmDelete)

    await sleep(rand(4000, 7000))
  }

  const waitUntilSelectionClears = async () => {
    await waitFor(
      () => getSelectedCount() === 0 || !!findClickableByText('Select'),
      10000,
      300,
    )

    await sleep(rand(2500, 4500))
  }

  let totalDeleted = 0
  let successesSincePause = 0
  let nextPauseAt = rand(CONFIG.pauseEveryMin, CONFIG.pauseEveryMax)

  try {
    while (true) {
      const selectVisible = !!findClickableByText('Select')
      const boxesVisible = getCheckboxes().length > 0

      if (!selectVisible && !boxesVisible) {
        log('Nothing left to process')
        break
      }

      if (hasErrorBanner()) {
        const backoffMs = errorBackoff()
        log(
          `Instagram error detected. Backing off for ${(backoffMs / 1000).toFixed(1)}s`,
        )
        await sleep(backoffMs)
      }

      const batch = await selectBatch()

      if (!batch.length) {
        log('No more comments available')
        break
      }

      log(`Selected ${getSelectedCount()} comment(s)`)
      await clickDeleteFlow()
      await waitUntilSelectionClears()

      if (hasErrorBanner()) {
        const backoffMs = errorBackoff()
        log(
          `Delete error detected after action. Backing off for ${(backoffMs / 1000).toFixed(1)}s`,
        )
        await sleep(backoffMs)
        continue
      }

      totalDeleted += batch.length
      successesSincePause += batch.length

      log(`Deleted ${batch.length} comment(s). Total so far: ${totalDeleted}`)

      if (successesSincePause >= nextPauseAt) {
        const pauseMs = longPause()
        log(`Pausing for ${(pauseMs / 1000).toFixed(1)}s`)
        await sleep(pauseMs)
        successesSincePause = 0
        nextPauseAt = rand(CONFIG.pauseEveryMin, CONFIG.pauseEveryMax)
      } else {
        await sleep(mediumDelay())
      }
    }

    log(`Finished. Total deleted: ${totalDeleted}`)
  } catch (err) {
    fail(err?.message || err)
    const backoffMs = errorBackoff()
    log(`Backing off for ${(backoffMs / 1000).toFixed(1)}s after error`)
    await sleep(backoffMs)
  }
})()
