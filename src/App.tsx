import { SnakeGame } from './components/SnakeGame';
import { MusicPlayer } from './components/MusicPlayer';

export default function App() {
  return (
    <div id="app-root" className="min-h-screen bg-black">
      <SnakeGame />
      <MusicPlayer />
    </div>
  );
}
