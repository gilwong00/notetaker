import React, { useState, useEffect } from 'react';
import { API, graphqlOperation, Auth } from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react';
import { createNote, deleteNote } from './graphql/mutations';
import { listNotes } from './graphql/queries';
import { onCreateNote, onDeleteNote } from './graphql/subscriptions';
import './App.css';

function App() {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [userName, setUserName] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    // using subscrptions instead of manually updating state

    // const { data } = await API.graphql(
    //   graphqlOperation(createNote, { input: { note: newNote } })
    // );
    // setNotes([...notes, data.createNote]);

    await API.graphql(
      graphqlOperation(createNote, { input: { note: newNote } })
    );
    setNewNote('');
  };

  const removeNote = async id => {
    return await API.graphql(graphqlOperation(deleteNote, { input: { id } }));
    // using subscrptions instead of manually updating state
    // const currenNotes = notes.slice();
    // setNotes([...currenNotes.filter(note => note.id !== id)]);
  };

  useEffect(() => {
    const fetchNotes = async () => {
      const res = await API.graphql(graphqlOperation(listNotes));
      setNotes(res.data.listNotes.items);
    };

		// we need username for our subscriptions since we specified an auth rule on our note schema
    const getUser = async () => {
      const user = await Auth.currentUserInfo();
      setUserName(user.username);
    };

    fetchNotes();
    getUser();
  }, []);

  // subscriptions
  useEffect(() => {
    const createNoteListener = API.graphql(
      graphqlOperation(onCreateNote, { owner: userName })
    ).subscribe({
      next: noteData => {
        const newNote = noteData.value.data.onCreateNote;
        const previousNotes = [...notes.filter(note => note.id !== newNote.id)];
        setNotes([...previousNotes, newNote]);
      }
    });
    const deleteNoteListener = API.graphql(
      graphqlOperation(onDeleteNote, { owner: userName })
    ).subscribe({
      next: noteData => {
        const deletedNote = noteData.value.data.onDeleteNote;
        const filteredNotes = [
          ...notes.filter(note => note.id !== deletedNote.id)
        ];
        setNotes(filteredNotes);
      }
    });

    return () => {
      createNoteListener.unsubscribe();
      deleteNoteListener.unsubscribe();
    };
  }, [notes, userName]);

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
            // can possibly add an update note functionality
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
