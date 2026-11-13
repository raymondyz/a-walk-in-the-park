import { useEffect, useRef } from 'react';

type CameraFlashProps = {
  trigger: number;
}

export default function CameraFlash({ trigger }: CameraFlashProps) {
  const flashRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (trigger === 0) return;

    flashRef.current?.animate(
      [
        { opacity: 0 },
        { opacity: 1, offset: 0.1, easing: 'ease-out' },
        { opacity: 0 }
      ],
      { duration: 300 }
    );
  }, [trigger]);

  return <div ref={flashRef} className="absolute inset-0 pointer-events-none bg-white opacity-0"></div>
}