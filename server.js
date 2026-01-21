const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient
const ObjectId = require('mongodb').ObjectId
const bcrypt = require('bcrypt')
const session = require('express-session')
const dotenv = require('dotenv')

dotenv.config();
const url = process.env.MONGO

const dbName = "PPE"
var db;

// Credenciales demo para portfolio
const DEMO_EMAIL = "demo@example.com";
const DEMO_PASSWORD = "demo123";

// Configuración de sesiones
app.use(session({
  secret: process.env.SESSION_SECRET || 'tu-secret-key-cambiar-en-produccion',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // true en producción con HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(express.static('public'))

// Middleware para verificar autenticación
const requireAuth = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.redirect('/login');
  }
};

// Función para inicializar el usuario demo
async function initializeDemoUser() {
  try {
    // Verificar si el usuario demo ya existe
    const existingUser = await db.collection('users').findOne({ username: DEMO_EMAIL.toLowerCase() });
    
    if (!existingUser) {
      // Hashear la contraseña
      const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);
      
      // Crear usuario demo
      await db.collection('users').insertOne({
        username: DEMO_EMAIL.toLowerCase(),
        password: hashedPassword,
        createdAt: new Date()
      });
      
      console.log('Usuario demo creado exitosamente');
    } else {
      console.log('Usuario demo ya existe');
    }
  } catch (error) {
    console.error('Error al inicializar usuario demo:', error);
  }
}

// Conectar a MongoDB
MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, async (error, client) => {
  if (error) {
    console.error('Error conectando a MongoDB:', error);
    process.exit(1);
  }
  db = client.db(dbName);
  console.log("Connected to `" + dbName + "`!");
  
  // Inicializar usuario demo
  await initializeDemoUser();
  
  app.listen(3200, () => {
    console.log('Servidor escuchando en puerto 3200');
    console.log('Abre tu navegador en http://localhost:3200');
  });
});

// Rutas de autenticación
app.get('/login', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/');
  }
  res.render('login.ejs', { 
    error: null,
    demoEmail: DEMO_EMAIL,
    demoPassword: DEMO_PASSWORD
  });
});

app.get('/register', (req, res) => {
  // Registro restringido - solo para demo
  res.status(403).send('Registro no disponible. Esta es una aplicación demo.');
});

app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  // Solo permitir el email demo específico
  if (email.toLowerCase() !== DEMO_EMAIL.toLowerCase()) {
    return res.status(403).send('Registro no disponible. Esta es una aplicación demo.');
  }

  if (!email || !password) {
    return res.status(400).send('Email y contraseña son requeridos');
  }

  try {
    // Verificar si el usuario demo ya existe
    const existingUser = await db.collection('users').findOne({ username: DEMO_EMAIL.toLowerCase() });
    
    if (existingUser) {
      return res.status(400).send('El usuario demo ya existe');
    }

    // Verificar que la contraseña sea la correcta para el demo
    if (password !== DEMO_PASSWORD) {
      return res.status(400).send('Contraseña incorrecta para el usuario demo');
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario demo
    const result = await db.collection('users').insertOne({
      username: DEMO_EMAIL.toLowerCase(),
      password: hashedPassword,
      createdAt: new Date()
    });

    // Crear sesión
    req.session.userId = result.insertedId.toString();
    req.session.username = DEMO_EMAIL;
    res.redirect('/');
  } catch (error) {
    console.error('Error al registrar:', error);
    res.status(500).send('Error al registrar usuario');
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.render('login.ejs', { 
      error: 'Usuario y contraseña son requeridos',
      demoEmail: DEMO_EMAIL,
      demoPassword: DEMO_PASSWORD
    });
  }

  try {
    const user = await db.collection('users').findOne({ username: username.toLowerCase() });
    
    if (!user) {
      return res.render('login.ejs', { 
        error: 'Usuario o contraseña incorrectos',
        demoEmail: DEMO_EMAIL,
        demoPassword: DEMO_PASSWORD
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.render('login.ejs', { 
        error: 'Usuario o contraseña incorrectos',
        demoEmail: DEMO_EMAIL,
        demoPassword: DEMO_PASSWORD
      });
    }

    // Crear sesión
    req.session.userId = user._id.toString();
    req.session.username = user.username;
    res.redirect('/');
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.render('login.ejs', { 
      error: 'Error al iniciar sesión',
      demoEmail: DEMO_EMAIL,
      demoPassword: DEMO_PASSWORD
    });
  }
});

app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error al cerrar sesión:', err);
    }
    res.redirect('/login');
  });
});

// Ruta principal - requiere autenticación
app.get('/', requireAuth, (req, res) => {
  if (db) {
    db.collection('items').find({ userId: req.session.userId }).toArray((err, result) => {
      if (err) {
        console.error('Error querying the database:', err);
        res.status(500).send('Database query error');
      } else {
        res.render('index.ejs', { 
          list: result,
          username: req.session.username,
          demoEmail: DEMO_EMAIL,
          demoPassword: DEMO_PASSWORD
        });
      }
    });
  } else {
    res.status(500).send('Database connection error');
  }
});

// Crear nuevo item - requiere autenticación
app.post('/items', requireAuth, (req, res) => {
  if (!req.body.things || !req.body.things.trim()) {
    return res.status(400).json({ error: 'La tarea no puede estar vacía' });
  }

  db.collection('items').insertOne({
    things: req.body.things.trim(),
    dueDate: req.body.dueDate || '',
    userId: req.session.userId,
    completed: false,
    createdAt: new Date()
  }, (err, result) => {
    if (err) {
      console.error('Error al guardar:', err);
      return res.status(500).json({ error: 'Error al guardar la tarea' });
    }
    console.log('Tarea guardada en la base de datos');
    res.status(201).json({ 
      success: true, 
      _id: result.insertedId,
      message: 'Tarea creada exitosamente' 
    });
  });
});

// Actualizar item - requiere autenticación y verificar ownership
app.put('/items', requireAuth, (req, res) => {
  if (!req.body._id) {
    return res.status(400).json({ error: 'ID de la tarea requerido' });
  }

  try {
    const filter = { 
      _id: ObjectId(req.body._id),
      userId: req.session.userId 
    };
    
    db.collection('items').findOneAndUpdate(
      filter,
      {
        $set: {
          completed: true,
          completedAt: new Date()
        }
      },
      { returnOriginal: false },
      (err, result) => {
        if (err) {
          console.error('Error al actualizar:', err);
          return res.status(500).json({ error: 'Error al actualizar la tarea' });
        }
        if (!result.value) {
          return res.status(404).json({ error: 'Tarea no encontrada' });
        }
        res.json({ success: true, message: 'Tarea actualizada' });
      }
    );
  } catch (error) {
    res.status(400).json({ error: 'ID inválido' });
  }
});

// Eliminar todos los items del usuario - requiere autenticación
app.delete('/items', requireAuth, (req, res) => {
  db.collection('items').deleteMany({ userId: req.session.userId }, (err, result) => {
    if (err) {
      console.error('Error al eliminar:', err);
      return res.status(500).json({ error: 'Error al eliminar las tareas' });
    }
    console.log(`${result.deletedCount} tareas eliminadas`);
    res.json({ 
      success: true, 
      deletedCount: result.deletedCount,
      message: 'Todas las tareas han sido eliminadas' 
    });
  });
});
