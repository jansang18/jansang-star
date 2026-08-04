export function AppError({ message, onClose }: { message: string; onClose: () => void }) {
  if (!message) return null;
  return <div className="app-error" role="alert"><b>별의 위치를 계산하지 못했어요</b><span>{message}</span><button type="button" onClick={onClose}>닫기</button></div>;
}
