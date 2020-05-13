import { useCallback, useState } from 'react'

const useForceUpdate = () => {
  const [, _forceUpdate] = useState(0)
  return useCallback(() => _forceUpdate(n => n + 1), [])
}

export default useForceUpdate
