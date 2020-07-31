import React, { useState } from 'react';
import { withAuthenticator } from 'aws-amplify-react';
import './App.css';

function App() {
  const [notes, setNotes] = useState([{ id: 1, note: 'test' }]);
  return (
    <div className='container'>
      <h1>Amplify Notetaker</h1>
      <form className='mb3'>
        <input type='text' placeholder='Write your note' />
        <button className='pa2 f4' type='submit'>
          Add Note
        </button>
      </form>

      <ul>
        {notes.map(note => {
          return (
            <li className='note-item' key={note.id}>
              {note.note} <span onClick={() => console.log('hit')}>&times;</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default withAuthenticator(App, { includeGreetings: true });
