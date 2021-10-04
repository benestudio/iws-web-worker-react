import React from 'react';
import ReactDOM from 'react-dom';
import {ErrorBoundary} from 'react-error-boundary'
import WorkerInfo from './WorkerInfo';
import Animation from './Animation';



function App() {
    const [mode, setMode] = React.useState('')
  
    console.log('rendering App')
  
    function ErrorFallback({error, resetErrorBoundary}) {
      return (
        <div role="alert">
          <p>Something went wrong:</p>
          <pre>{error.message}</pre>
          <button onClick={resetErrorBoundary}>Try again</button>
        </div>
      )
    }
  
    
  
    function handleSubmit(event) {
      event.preventDefault()
      
      setMode(event.target.id)
    }
  
    return (

    
      <div>
        <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // reset the state of your app so the error doesn't happen again
        setMode('');
      }}
    >
        <form onSubmit={handleSubmit}>
          <label htmlFor="btnGroup">Please select an option to download CSV file</label>
          <div id="btnGroup">
            <button id="mode1" type="button"  onClick={handleSubmit}>Main Thread Process</button>
            <button id="mode2" type="button"  onClick={handleSubmit}>Background Process</button>
            <button id="mode3" type="button"  onClick={handleSubmit}>Background with Zero Copy</button>
          </div>
        </form>
        <hr />
        <WorkerInfo workerMode={mode} />
        <Animation />
        </ErrorBoundary>
      </div>
    )
  }

ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById('root')
  );