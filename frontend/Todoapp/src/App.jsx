import { useEffect, useState } from 'react';
import axios from "axios";
import Swal from 'sweetalert2';
import './App.css'

function App() {
  //State
  const [notes, setNotes] = useState([])
  const API_URL = 'http://localhost:5038';

  //Comportement
  const bringNotes = async () => {
    try {
      const response = await axios.get(API_URL + '/api/todoapp/getnotes');
      setNotes(response.data); // Assurez-vous que response.data est bien un tableau d'objet
    } catch (error) {
      console.error("Une erreur est survenue lors du rafraîchissement des notes :", error);
    }
  };

  useEffect(() => {
    bringNotes();
  }, []);

  const handleSubmit = async(e) => {
    e.preventDefault();
    console.log(e.target);
    const form = e.target;
    const elements = form.elements;
    console.log(elements); 
    const description = elements.newNotes.value.trim();
    if (description === '') {
      alert("Veuillez entrer une description.");
      return;
    }
    try {
      const newNote = { descript: description };
      console.log("Données envoyées :", newNote); // Journal de débogage
      const response = await axios.post(API_URL + '/api/todoapp/addnotes', newNote);
      console.log("Réponse du serveur :", response.data); // Journal de débogage
      form.reset();
      bringNotes();
    } catch (error) {
      console.error("Une erreur est survenue lors de l'ajout de la nouvelle note :", error);
    }
  };

  const deleteNote = async(e,id)=>{
    e.preventDefault();
    const alertResponse = await Swal.fire({
      title:"Voulez-vous supprimer cette note ?",
      text :"Cette action est definitive",
      icon:"warning",
      showCancelButton:true,
      confirmButtonColor:"#3085d6",
      cancelButtonColor:"#d33",
      confirmButtonText:"Operer",
      cancelButtonText:"Annuler"
    })
    if(alertResponse.isConfirmed){
     try{
      const response = await axios.delete(`${API_URL}/api/todoapp/deletenotes/${id}`);
      console.log("Réponse du serveur :", response.data); // Journal de débogage
      bringNotes();// Rafraichir les données apres la suppression
      Swal.fire({
        title:"La note a bien été supprimée",
        icon:"success"
      })
     }catch(error){
      console.log("Une erreur est survenue lors de la suppression de la note :", error);
      Swal.fire({ 
        title:"Une erreur est survenue lors de la suppression de la note",
        icon:"error"
     });
     }
    }

  } 

  //Affichage
  return (
    <div className="grid grid-cols-12 place-items-center">
      <h1 className='col-span-12 text-5xl mb-[60px]'>Todo App</h1>
      <div className='w-full col-span-12 flex justify-center h-full'>
        <div className='w-[80%] grid grid-cols-12 place-items-center gap-4 h-full'>
          {notes.map((note) => (
            <div key={note.id} className='shadow-lg relative text-2xl col-span-4 border-2 w-full h-[250px] rounded-xl'>
              <p className='text-center mb-[80px]'>* {note.description}</p>
              <span className='text-[100px]'>{note.id}</span>
              <button 
              className='absolute bottom-0 right-0 p-2 text-center'
              onClick={(e)=>deleteNote(e,note.id)}
              >
              x
              </button>
            </div>
          ))}
        </div>
      </div>
        <form className='col-span-12 w-[80%] flex justify-center mt-[100px]' onSubmit={handleSubmit}>
        <input type='text' id="newNotes"
          placeholder='Ajouter une nouvelle note'
          className='w-full h-20 text-center text-2xl border-2 border-black rounded-lg outline-none'
         />
        <button type="submit" id='addNotes' 
        className='w-full h-20 bg-black text-white rounded-lg ml-2'
        >
          Ajouter
        </button>
        </form>
      </div>
  );
}

export default App
