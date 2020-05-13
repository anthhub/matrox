import { useRef } from 'react'

const useThis = (args?: any) => {
  const comp = useRef({ args })

  return comp.current
}

export default useThis
