import express from 'express';
// import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';
import cors from 'cors';
import multer from 'multer';// fichier gestion

const app = express();
//Finalement j'abandonne le procede natif de mongoDB pour se connecter a la base 
//de donnees puis je passe a l'usage de mongoose. Avec npm install mongoose efficace et rapide procede.

//mongodb://localhost:27017/
//mongodb+srv://zachariebigboss:cbP04Eck17rpOZ4M@cluster0.3clpesf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
const PORT = process.env.PORT || 5038;
// const CONNECTION_STRING = "mongodb+srv://zachariebigboss:cbP04Eck17rpOZ4M@cluster0.3clpesf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
// const DATABASENAME = "todoappdb";
// let database;

// Middleware pour accepter les requêtes de type JSON
app.use(express.json());

// Middleware pour permettre CORS le traitements des demandes de donnees depuis le frontend
app.use(cors());

// Connexion à MongoDB
// async function connectToDatabase() {
//     try {
//         const mongo = await mongoose.connect(CONNECTION_STRING);
//         database = mongo.connection.useDb(DATABASENAME);
//         console.log("MongoDB connection successful");
//     } catch (error) {
//         console.error("MongoDB connection error", error);
//         process.exit(1);
//     }
// }

// Lancer le serveur après la connexion à MongoDB
// connectToDatabase().then(() => {
//     app.listen(PORT, () => {
//         console.log(`Server is running on port ${PORT}`);
//     });
// }).catch(error => {
//     console.error("Failed to connect to the database:", error);
//     process.exit(1);
// });

const ourUsers = [
    { id: 1, name: 'John Doe', email: 'johndoe@gmail.com' },
    { id: 2, name: 'Jane Doe', email: 'janedoe@gmail.com' },
    { id: 3, name: 'Jack Doe', email: 'jackdoe@gmail.com' },
    { id: 4, name: 'Jim Doe', email: 'jimdoe@gmail.com' },
    { id: 5, name: 'jill Doe', email: 'jilldoe@gmail.com' },
    { id: 6, name: 'joe Doe', email: 'joedoe@gmail.com' },
    { id: 7, name: 'jean Doe', email: 'jeandoe@gmail.com' },
];

const noteSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // Ajout d'un identifiant personnalisé
    description: String,
}, { timestamps: true });

const Note = mongoose.model('Note', noteSchema);

// GET - Récupérer toutes les notes
app.get('/api/todoapp/getnotes', async (req, res) => {
    try {
        const notes = await Note.find();
        res.status(200).send(notes);
    } catch (error) {
        console.error("Une erreur est survenue", error);
        res.status(500).json({ message: "Erreur lors de la récupération des notes" });
    }
});

// POST - Ajouter une nouvelle note
app.post('/api/todoapp/addnotes', async (req, res) => {
    try {
        const newNote = new Note({
            description: req.body.newNote
        });
        await newNote.save();
        res.status(201).json({ message: "Nouvelle note insérée avec succès", note: newNote });
    } catch (error) {
        console.error("Une erreur est survenue", error);
        res.status(500).json({ message: "Erreur lors de l'ajout de la note" });
    }
});

// DELETE - Supprimer une note
app.delete('/api/todoapp/deletenotes/:id', async (req, res) => {
    try {
        const result = await Note.findByIdAndDelete(req.params.id);
        if (!result) {
            return res.status(404).json({ message: "Note non trouvée" });
        }
        res.status(200).json({ message: "La note a bien été supprimée" });
    } catch (error) {
        console.error("Une erreur est survenue", error);
        res.status(500).json({ message: "Erreur lors de la suppression de la note" });
    }
});

// PUT - Mettre à jour une note (si vous en avez besoin)
app.put('/api/todoapp/updatenotes/:id', async (req, res) => {
    try {
        const updatedNote = await Note.findByIdAndUpdate(
            req.params.id,
            { description: req.body.description },
            { new: true }
        );
        if (!updatedNote) {
            return res.status(404).json({ message: "Note non trouvée" });
        }
        res.status(200).json({ message: "Note mise à jour avec succès", note: updatedNote });
    } catch (error) {
        console.error("Une erreur est survenue", error);
        res.status(500).json({ message: "Erreur lors de la mise à jour de la note" });
    }
});

// Méthode GET qui fonctionne par l'URL
// app.get('/api/todoapp/getnotes', async (request, response) => {
//     console.log('URL bien atteinte');
//     try {
//         let notes = await database.collection('todoappcollection').find({}).toArray();
//         console.log('Success du fetching des notes');
//         return response.status(200).send(notes);
//     } catch (error) {
//         console.error("Une erreur est survenue", error);
//         return response.sendStatus(500);
//     }
// });

app.get('/', (request, response) => {
    response.status(201).send({ msg: 'Hello World!' });
});

app.get('/api/users', (request, response) => {
    const filter = request.query.filter;
    const value = request.query.value;
    console.log({ filter, value });

    let filteredUsers = ourUsers;

    if (filter && value) {
        filteredUsers = filteredUsers.filter((user) => {
            return user[filter].toString().toLowerCase().includes(value.toLowerCase());
        });
    }

    const id = request.query.id;
    const sortby = request.query.sortby;

    console.log({ id, sortby });

    if (id) {
        filteredUsers = filteredUsers.filter(user => user.id === parseInt(id));
    }

    if (sortby === 'name') {
        filteredUsers = filteredUsers.sort((a, b) => a.name.localeCompare(b.name));
    }

    response.status(200).send(filteredUsers);
});

app.get('/api/users/:id', (request, response) => {
    console.log(request.params);
    const parsedId = parseInt(request.params.id);
    console.log(parsedId);
    if (isNaN(parsedId)) return response.status(400).send({ msg: 'Bad request. Invalid id' });
    const findUser = ourUsers.find((user) => user.id === parsedId);
    if (!findUser) return response.sendStatus(404);
    return response.status(200).send(findUser);
});

// Methode POST

app.post('/api/users', (request, response) => {
    console.log(request.body);
    const { body } = request;
    const lastId = ourUsers[ourUsers.length - 1].id;
    console.log(lastId);
    const newUser = { id: lastId + 1, ...body };
    ourUsers.push(newUser);
    return response.status(201).send(newUser);
});

//ici se trouve la fonction de d'intersion en base de donnée
// app.post('/api/todoapp/addnotes', async (request, response) => {
//     try {
//         // Comptage des documents dans la collection
//         const numberOfNotes = await database.collection('todoappcollection').count({});
//         // Insertion du nouveau document
//         const newNote = {
//             id: (numberOfNotes + 1).toString(),
//             description : request.body.descript

//         };
//         await database.collection("todoappcollection").insertOne(newNote);
//         // Réponse de succès
//       response.status(201).json("Nouvelle note insérée avec succès");

//     } catch (error) {
//         console.error("Une erreur est survenue", error);
//         return response.sendStatus(500);
//     }
// })


// Methode PUT

app.put('/api/users/:id', (request, response) => {
    const { body, params: { id } } = request;
    if (isNaN(parseInt(id))) return response.sendStatus(400);
    const findIndex = ourUsers.findIndex((user) => user.id === parseInt(id));
    if (findIndex === -1) return response.sendStatus(404);
    ourUsers[findIndex] = { id: parseInt(id), ...body };
    return response.sendStatus(200);
});

// Methode PATCH

app.patch('/api/users/:id', (request, response) => {
    const { body, params: { id } } = request;
    if (isNaN(parseInt(id))) return response.sendStatus(400);
    const findIndex = ourUsers.findIndex((user) => user.id === parseInt(id));
    if (findIndex === -1) return response.sendStatus(404);
    ourUsers[findIndex] = { ...ourUsers[findIndex], ...body };
    return response.sendStatus(200);
});

// Methode DELETE

app.delete('/api/users/:id', (request, response) => {
    const { params: { id } } = request;
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) return response.sendStatus(400);
    const findIndex = ourUsers.findIndex((user) => user.id === parsedId);
    if (findIndex === -1) return response.sendStatus(404);
    ourUsers.splice(findIndex, 1); // Correction: Ajout du 1 pour supprimer un seul élément
    return response.sendStatus(200);
});

//ici se trouve la fonction de supression en base de donnée
// app.delete('/api/todoapp/deletenotes', async (request, response) => {
//     try {
//         let notes = await database.collection("todoappcollection");
//         const oldNote = {
//              id: request.body.id
//         }
//         await notes.deleteOne(oldNote);
//         response.status(200).json("La note a bien été supprimée");
//     } catch (error) {
//         console.error("Une erreur est survenue", error);
//         return response.sendStatus(500);
//     }
// })

// Catch-all error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});





//Le meme code avec les commentaire pour la precision 
//###################################################
// import express from 'express';
// import { MongoClient } from 'mongodb';
// import cors from 'cors';
// import multer from 'multer';

// const app = express();

// const PORT = process.env.PORT || 5038;
// const CONNECTION_STRING = "mongodb+srv://zachariebigboss
// @cluster0.3clpesf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
// const DATABASENAME = 'todoappdb';
// let database;

// // Middleware pour accepter les requêtes de type JSON
// app.use(express.json());

// // Middleware pour permettre CORS
// app.use(cors());

// // Connexion à MongoDB
// async function connectToDatabase() {
// try {
// const client = await MongoClient.connect(CONNECTION_STRING);
// database = client.db(DATABASENAME);
// console.log("MongoDB connection successful");
// } catch (error) {
// console.error("MongoDB connection error", error);
// process.exit(1);
// }
// }

// // Lancer le serveur après la connexion à MongoDB
// connectToDatabase().then(() => {
// app.listen(PORT, () => {
// console.log(Server is running on port ${PORT});
// });
// });

// const ourUsers = [
// { id: 1, name: 'John Doe', email: 'johndoe@gmail.com' },
// { id: 2, name: 'Jane Doe', email: 'janedoe@gmail.com' },
// { id: 3, name: 'Jack Doe', email: 'jackdoe@gmail.com' },
// { id: 4, name: 'Jim Doe', email: 'jimdoe@gmail.com' },
// { id: 5, name: 'jill Doe', email: 'jilldoe@gmail.com' },
// { id: 6, name: 'joe Doe', email: 'joedoe@gmail.com' },
// { id: 7, name: 'jean Doe', email: 'jeandoe@gmail.com' },
// ];

// //Methode GET qui fonnctionne par l'url

// app.get('/api/todoapp/notes', async(request, response)=>{
// console.log('URL bien atteinte');
// try{
// let notes = await database.collection('todoappcollection').find({}).toArray();
// return response.status(200).send(notes);
// console.log('Success du feching des notes');
// }catch(error){
// console.log("Une erreur est survenue", error);
// }
// })

// app.get('/', (request, response) => {
// response.status(201).send({ msg: 'Hello World!' });
// });

// app.get('/api/users', (request, response) => {
// //Query parameters
// const filter = request.query.filter;
// const value = request.query.value;
// console.log({ filter, value });

// scss
// Copier le code
// let filteredUsers = ourUsers;

// //Quand filter et value sont definis
// if (filter && value) {
//     filteredUsers = filteredUsers.filter((user) => {
//         // Utilisation de toLowerCase() pour insensibilité à la casse
//         return user[filter].toString().toLowerCase().includes(value.toLowerCase());
//     });
// }

// const id = request.query.id;
// const sortby = request.query.sortby;

// console.log({ id, sortby });

// // Quand id est défini
// if (id) {
//     filteredUsers = filteredUsers.filter(user => user.id === parseInt(id));
// }

// // Quand sortby est défini et égale à 'name'
// if (sortby === 'name') {
//     filteredUsers = filteredUsers.sort((a, b) => a.name.localeCompare(b.name));
// }

// // Envoyer la réponse
// response.status(200).send(filteredUsers);
// });

// app.get('/api/users/
// ', (request, response) => {
// //Route parameters
// console.log(request.params);
// const parsedId = parseInt(request.params.id);
// console.log(parsedId);
// if (isNaN(parsedId)) return response.status(400).send({ msg: 'Bad request. Ivalid id' });
// const findUser = ourUsers.find((user) => user.id === parsedId);
// if (!findUser) return response.sendStatus(404);
// return response.status(200).send(findUser);

// });

// //Methode POST

// app.post('/api/users', (request, response) => {
// console.log(request.body);
// const { body } = request;
// const lastId = ourUsers[ourUsers.length - 1].id;
// console.log(lastId);
// const newUser = { id: lastId + 1, ...body };
// ourUsers.push(newUser);
// return response.status(201).send(newUser);
// });

// //Methode PUT

// app.put('/api/users/
// ', (request, response) => {
// //Destructuration des paramètres de la requête, c'est une extraction de l'objet request
// const {
// body,
// params: { id }
// } = request;
// if (isNaN(parseInt(id))) return response.sendStatus(400);
// const findIndex = ourUsers.findIndex((user) => user.id === parseInt(id));
// if (findIndex === -1) return response.sendStatus(404);
// //Exclure l'ID du body s'il existe
// // const { id: bodyId, ...restBody } = body;
// // const restBody = { ...body };
// // delete restBody.id;
// ourUsers[findIndex] = { id: parseInt(id), ...body };
// return response.sendStatus(200);

// arduino
// Copier le code
// //On peut aussi faire comme ceci : 
// //  // Exclure l'ID du body s'il existe
// //  const { id: bodyId, ...restBody } = body;

// //  // Mettre à jour l'utilisateur tout en gardant l'ID constant
// //  ourUsers[userIndex] = { ...ourUsers[userIndex], ...restBody };
// });

// //Methode PATCH

// app.patch('/api/users/
// ', (request, response) => {
// const { body, params: { id } } = request;
// if (isNaN(parseInt(id))) return response.sendStatus(400);
// const findIndex = ourUsers.findIndex((user) => user.id === parseInt(id));
// if (findIndex === -1) return response.sendStatus(404);
// ourUsers[findIndex] = { ...ourUsers[findIndex], ...body };
// return response.sendStatus(200);
// });

// //Methode DELETE

// app.delete('/api/users/
// ', (request, response) => {
// const { params: { id } } = request
// const parsedId = parseInt(id);
// if (isNaN(parsedId)) return response.sendStatus(400);
// const findIndex = ourUsers.findIndex((user) => user.id === parsedId);
// if (findIndex === -1) return response.sendStatus(404);
// ourUsers.splice(findIndex);
// return response.sendStatus(200);
// });