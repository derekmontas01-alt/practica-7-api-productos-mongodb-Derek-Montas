
require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const Producto = require('./models/Producto')

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Conectado a MongoDB correctamente')
    })
    .catch((error) => {
        console.error('Error al conectar a MongoDB:', error.message)
    })

// GET /productos - Listar todos los productos almacenados en MongoDB
app.get('/productos', async (req, res) => {
    try {
        const productos = await Producto.find()
        res.json(productos)
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener los productos' })
    }
})

// GET /productos/:id - Obtener un producto especifico por su _id
app.get('/productos/:id', async (req, res) => {
    try {
        const producto = await Producto.findById(req.params.id)
        if (!producto) {
            return res.status(404).json({ mensaje: 'Producto no encontrado' })
        }
        res.json(producto)
    } catch (error) {
        res.status(400).json({ mensaje: 'Id no valido' })
    }
})

// POST /productos - Crear un producto nuevo en MongoDB
app.post('/productos', async (req, res) => {
    try {
        const { nombre, descripcion, precio } = req.body

        if (!nombre || !descripcion || precio === undefined || precio === null || precio === '') {
            return res.status(400).json({
                mensaje: 'Los campos nombre, descripcion y precio son obligatorios'
            })
        }

        const productoCreado = await Producto.create({ nombre, descripcion, precio })
        res.status(201).json(productoCreado)
    } catch (error) {
        if (error.name === 'ValidationError' || error.name === 'CastError') {
            return res.status(400).json({ mensaje: error.message })
        }
        res.status(500).json({ mensaje: 'Error al crear el producto' })
    }
})

// PUT /productos/:id - Actualizar un producto existente en MongoDB
app.put('/productos/:id', async (req, res) => {
    try {
        const { nombre, descripcion, precio } = req.body

        if (!nombre || !descripcion || precio === undefined || precio === null || precio === '') {
            return res.status(400).json({
                mensaje: 'Los campos nombre, descripcion y precio son obligatorios'
            })
        }

        const productoActualizado = await Producto.findByIdAndUpdate(
            req.params.id,
            { nombre, descripcion, precio },
            { new: true, runValidators: true }
        )

        if (!productoActualizado) {
            return res.status(404).json({ mensaje: 'Producto no encontrado' })
        }

        res.json(productoActualizado)
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ mensaje: 'Id no valido' })
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({ mensaje: error.message })
        }
        res.status(500).json({ mensaje: 'Error al actualizar el producto' })
    }
})

// DELETE /productos/:id - Eliminar un producto por su _id en MongoDB
app.delete('/productos/:id', async (req, res) => {
    try {
        const productoEliminado = await Producto.findByIdAndDelete(req.params.id)

        if (!productoEliminado) {
            return res.status(404).json({ mensaje: 'Producto no encontrado' })
        }

        res.json({
            mensaje: 'Producto eliminado',
            producto: productoEliminado
        })
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ mensaje: 'Id no valido' })
        }
        res.status(500).json({ mensaje: 'Error al eliminar el producto' })
    }
})

// Inicio del servidor HTTP en el puerto configurado
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`)
})