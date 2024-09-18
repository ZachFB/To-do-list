import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();
 
app.use(express.json());
app.use(cors());

//connection a la base de donnees

const uri = 'mongodb+srv://zachariebigboss:cbP04Eck17rpOZ4M@cluster0.3clpesf.mongodb.net/todoappdb?retryWrites=true&w=majority&appName=Cluster0';

async function connectToDatabase() {
    try {
        await mongoose.connect(uri);
        console.log("MongoDB connection successful");
    } catch (error) {
        console.error("MongoDB connection error", error);
        process.exit(1);
    }
}

const PORT = process.env.PORT || 5038;

connectToDatabase().then(()=>{
  app.listen(PORT, ()=>{
  console.log(`Server is running on port ${PORT}`);
  });
}).catch(error=>{
    console.error("Failed to connect to the database:", error);
    process.exit(1);
})

//Les notes avec mongoose
const noteSchema = new mongoose.Schema({
id : { type: String, required: true, unique: true },
description: String
})
const Note = mongoose.model('Note', noteSchema);
// Si ce model de note avait ete creer dans un autre fichier on allait fait:
// export default Note; Pour l'exporter et l'utiliser dans une autre page en faisant 
// import Note from 'le chemin du fichier d'origine';

// Requete pour recuperer les notes 
app.get('/api/todoapp/getnotes', async (req, res) => {
    try {
        // Récupérer les documents de la collection 'notes'
        const notes = await Note.find({}, { _id: 0, id: 1, description: 1 }); // Projection pour inclure seulement id et description

        // Créer un tableau d'objets avec descriptions et IDs
        const formattedNotes = notes.map(note => ({
            id: note.id,
            description: note.description
        }));
        res.status(200).json(formattedNotes); // Répondre avec le tableau d'objets
    } catch (error) {
        console.error("Erreur lors de la récupération des notes", error);
        res.status(500).json({ message: "Erreur lors de la récupération des notes" });
    }
});

//Requete pour publier une note
app.post('/api/todoapp/addnotes', async (req, res) => {
    const description = req.body.descript;

    if (!description) 
    return res.status(400).json({ message: "Le champ 'description' est requis" });
    
    try {
        // Compter le nombre de documents existants
        const count = await Note.countDocuments();

        // Générer un nouvel id en incrémentant le nombre de documents
        const newId = count + 1;

        // Créer une nouvelle note avec l'id généré et la description reçue
        const newNote = new Note({ id: newId, description: description });
        await newNote.save();

        res.status(201).json(newNote); // Répondre avec la note ajoutée et un statut 201 Created
    } catch (error) {
        console.error("Erreur lors de l'ajout de la note", error);
        res.status(500).json({ message: "Erreur lors de l'ajout de la note" });
    }
});

//Requete pour supprimer une note 
app.delete('/api/todoapp/deletenotes/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deletedNote = await Note.findOneAndDelete({ id: Number(id) });

        if (!deletedNote) {
            return res.status(404).json({ message: "Note non trouvée" });
        }

        res.status(200).json({ message: "Note supprimée avec succès" });
    } catch (error) {
        console.error("Erreur lors de la suppression de la note", error);
        res.status(500).json({ message: "Erreur lors de la suppression de la note" });
    }
});