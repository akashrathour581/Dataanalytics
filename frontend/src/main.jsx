import {Component,StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import './index.css';
import App from './App.jsx';
class ErrorBoundary extends Component {
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true};}
 render(){return this.state.failed?<main className="platform" style={{padding:32}}><h1>Something went wrong</h1><p>Reload the page to try again. Retained datasets can be reopened from their tool page.</p><button onClick={()=>window.location.reload()}>Reload page</button><p><a href="/tools">Return to all tools</a></p></main>:this.props.children;}
}
createRoot(document.getElementById('root')).render(<StrictMode><ErrorBoundary><App/></ErrorBoundary></StrictMode>);
