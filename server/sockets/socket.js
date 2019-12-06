const { io } = require('../server');

const { Usuarios } = require('./classes/usuarios');
const usuarios = new Usuarios();

const { crearMensaje } = require('../utilidades/utilidades');


io.on('connection', (client) => {

    //console.log('Usuario conectado');

    client.on('entrarChat', (data, callback) => {
        //console.log(data);
        if (!data.nombre || !data.sala) {
            return callback({
                error: true,
                mensaje: 'El nombre y sala  son necesarios'
            });
        }

        // Para agregar a un usuario a auna sala
        client.join(data.sala);

        // Se inidica a los usuarios que un nuevo usuario se conectó
        let personas = usuarios.agregarPersona(client.id, data.nombre, data.sala);
        console.log(data.sala);
        console.log(usuarios.getPersonasPorSala(data.sala));
        console.log(usuarios.getPersonas());
        client.broadcast.to(data.sala).emit('listaPersona', usuarios.getPersonasPorSala(data.sala));
        client.broadcast.to(data.sala).emit('crearMensaje', crearMensaje('Administrador', `${ data.nombre } se unió`));

        // Se devuelve a todas las personas  (de la sala)
        //callback(personas);
        callback(usuarios.getPersonasPorSala(data.sala));
    });

    client.on('crearMensaje', (data) => {
        let persona = usuarios.getPersona(client.id);

        let mensaje = crearMensaje(persona, data.mensaje);
        client.broadcast.emit('crearMensaje', mensaje);
    });

    client.on('disconnect', () => {
        let personaBorrada = usuarios.borrarPersona(client.id);
        console.log(personaBorrada.sala);
        console.log(usuarios.getPersonasPorSala(personaBorrada.sala));
        console.log(usuarios.getPersonas());
        client.broadcast.to(personaBorrada.sala).emit('crearMensaje', crearMensaje('Administrador', `${personaBorrada.nombre} salio del chat`));
        client.broadcast.to(personaBorrada.sala).emit('listaPersona', usuarios.getPersonasPorSala(personaBorrada.sala));
    });

    client.on('mensajePrivado', (data) => {
        let persona = usuarios.getPersona(client.id);

        client.broadcast.to(data.para).emit('mensajePrivado', crearMensaje(persona, data.mensaje));
    });


    /*
    client.emit('enviarMensaje', {
        usuario: 'Administrador',
        mensaje: 'Bienvenido a esta aplicación'
    });


    // Escuchar el cliente
    client.on('enviarMensaje', (data, callback) => {
        console.log(data);
        client.broadcast.emit('enviarMensaje', data);
    });
    */
});