import './index.css';
import { createRoot } from 'react-dom/client';

const App = () => <h1>Hello</h1>


const root = createRoot(document.querySelector('#app'))

root.render(<App/>)