import React, { useState, useEffect } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react';
import { createNote, deleteNote } from './graphql/mutations';
import { listNotes } from './graphql/queries';
import './App.css';

function App() {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    const { data } = await API.graphql(
      graphqlOperation(createNote, { input: { note: newNote } })
    );
    setNotes([...notes, data.createNote]);
    setNewNote('');
  };

  const removeNote = async id => {
    await API.graphql(graphqlOperation(deleteNote, { input: { id } }));
    const currenNotes = notes.slice();
    setNotes([...currenNotes.filter(note => note.id !== id)]);
  };

  useEffect(() => {
    const fetchNotes = async () => {
      const res = await API.graphql(graphqlOperation(listNotes));
      setNotes(res.data.listNotes.items);
    };

    fetchNotes();
  }, []);

  return (
    <div className='container'>
      <h1>Amplify Notetaker</h1>

      <form className='mb3' onSubmit={handleSubmit}>
        <input
          type='text'
          placeholder='Write your note'
          onChange={e => setNewNote(e.target.value)}
          value={newNote}
        />
        <button className='pa2 f4' type='submit'>
          Add Note
        </button>
      </form>

      <ul>
        {notes.map(note => {
          return (
            <li className='note-item' key={note.id}>
              {note.note}{' '}
              <span onClick={() => removeNote(note.id)}>&times;</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default withAuthenticator(App, { includeGreetings: true });
