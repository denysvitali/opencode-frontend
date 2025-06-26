import { useUIStore } from '../../stores/uiStore.js';
import ChatView from '../chat/ChatView.js';
import FileExplorer from '../filesystem/FileExplorer.js';
import GitDiffView from '../filesystem/GitDiffView.js';
import TerminalView from '../terminal/TerminalView.js';

export default function MainView() {
  const { activeView } = useUIStore();

  switch (activeView) {
    case 'chat':
      return <ChatView />;
    case 'filesystem':
      return <FileExplorer />;
    case 'git-diff':
      return <GitDiffView />;
    case 'terminal':
      return <TerminalView />;
    default:
      return <ChatView />;
  }
}
