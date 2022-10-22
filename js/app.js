// todo VARIABLES Y SELECTORES

// seleccionamos el formulario para recolectar la informacion de los gastos que vamos a hacer
const formulario = document.querySelector('#agregar-gasto');

// seleccionamos la ul donde vamos a ir colocando todos los gastos que vamos haciendo
const lista = document.querySelector('#gastos ul');



// EVENT LISTENERS

eventListeners();
function eventListeners() {
    // ni bien carga el documento ya pedimos el valor del presupuesto
    document.addEventListener('DOMContentLoaded', preguntarPresupuesto);

    // del formulario vamos a agregar el gasto que van a cargar
    formulario.addEventListener('submit', agregarGasto);
};



// todo CLASES---- vamos a tener 2 clases, una del presupuesto y otra de la interfaz de usuario

class Presupuesto {
    constructor(presupuesto){
        // utilizamos Number porque el prompt devuelve un valor string, entonces lo convertimos a numero
        // y tambien utilizamos el restante ya que es lo mismo al ingresar el monto
        this.presupuesto = Number(presupuesto);
        this.restante = Number(presupuesto);
        // gastos es algo que pertenece al objeto donde vamos almacenando los gastos generados, el que vamos a ir llenando poco a poco y tambien restando cuando eliminenos gastos
        this.gastos = [];
    };
    
    nuevoGasto(gasto) {
        // usamos la referencia del mismo atributo en el mismo objeto
        this.gastos = [...this.gastos, gasto];
        // llamamos cuando agregamos un nuevo gasto
        this.calcularRestante(); // se llama a un metodo creado dentro de una objeto con this
    };

    // creamos un metodo para ir calculando cunato vamos gastando seria la suma de todos los gastos
    calcularRestante() {
        const gastos = this.gastos;

        // reduce itera sobre todos los elementos del arreglo y va acumulando los valores en un total
        // reduce es uno de los pocos arrays methods que toma 2 parametros
        const gastado = gastos.reduce((total, gasto) => total + gasto.cantidad, 0);

        // realizamos el calculo de restante
        this.restante = this.presupuesto - gastado;   
        console.log(this.restante);
    };

    eliminarGasto(id) {
        // aca traemos todos los elementos menos el seleccionado
        this.gastos = this.gastos.filter(gasto => gasto.id !== id);
        this.calcularRestante();
    };
};

class UI { // no necesita constructor porque vamos a tener metodos que impriman html basados en la clase presupuesto
    insertarPresupuesto(cantidad) {
        // console.log(cantidad);
        // hacemos destructuring para extraer los valores que necesitamos
        const {presupuesto, restante} = cantidad;

        // luego los agregamos al html directamente
        document.querySelector('#total').textContent = presupuesto;
        document.querySelector('#restante').textContent = restante;
    };

    imprimirAlerta(mensaje, tipo) {
        // creamos un div para el mensaje
        const divAlerta = document.createElement('div');
        divAlerta.classList.add('text-center', 'alert');

        // ahora vamos a condicionar que tipo de error pasamos por ser reutilizable el metodo
        if(tipo === 'error') {
            divAlerta.classList.add('alert-danger');
        } else {
            divAlerta.classList.add('alert-success');
        };

        // luego le agregamos el mensaje de error
        divAlerta.textContent = mensaje;

        // insertamos el mensaje en el html, con insertBefore antes del formulario como referencia
        // seleccionamos el primario que seria toda la parte izquierda e insertamos el mensaje antes del formulario
        document.querySelector('.primario').insertBefore(divAlerta, formulario);

        // luego de 3 seg quitaremos ese cartel de advertencia
        setTimeout(() => {
            divAlerta.remove();
        }, 3000);
    };

    // imprimimos el gasto en el html
    mostrarGastos(gastos) {
        
        // limpiamos el html
        this.limpiarHtml();


        // vamos a iterar sobre los gastos pasados e ir mostrandolos, GASTOS ES UN ARREGLO DE OBJETOS
        gastos.forEach(gasto => {

            // destructuring al gasto
            const {cantidad, nombre, id} = gasto;

            // creamos un LI por cada elemento
            const nuevoGasto = document.createElement('li');
            nuevoGasto.className = 'list-group-item d-flex justify-content-between align-items-center';
            // con este codigo colocamos un atributo al li
            nuevoGasto.dataset.id = id; // donde le colocamos el id extraido del objeto gasto, dataset va a agregar el data y despues del punto le agrega lo que queremos data-id

            // agregamos a la lista el html necesario para luego inyectarlo
            nuevoGasto.innerHTML = `${nombre} <span class="badge badge-primary badge-pill">$ ${cantidad} </span>`;

            // boton para eliminar el gasto
            const btnBorrar = document.createElement('button');
            btnBorrar.classList.add('btn', 'btn-danger', 'borrar-gasto');
            btnBorrar.innerHTML = `Borrar &times`;
            // aqui al presionar este boton vamos a ejecutar un arrow, desde el metodo onclick
            btnBorrar.onclick = () => {
                // funcion para eliminar un gasto y reembolsarlo
                eliminarGasto(id);
            };
            nuevoGasto.appendChild(btnBorrar);

            // agregamos el boton al html
            lista.appendChild(nuevoGasto);
        });
    };

    actualizarRestante(restante) {
        document.querySelector('#restante').textContent = restante;
    };

    // ponemos presupuestoObj porque presupuesto lo declaramos global
    comprobarPresupuesto(presupestoObj) {
        const {presupuesto, restante} = presupestoObj;

        // seleccionamos el div donde esta la clase de restante
        const restanteDiv = document.querySelector('.restante');

        // aca vamos a condicionar si gastamos mas del 75% dividiendo por 4 el presupuesto y si este es mayor al restante cambiamos el style del restante
        if(restante < (presupuesto / 4)) {
            restanteDiv.classList.remove('alert-succes', 'alert-warning'); // ponemos el warning porque si ya paso por ahi esta en el html y lo eliminamos
            restanteDiv.classList.add('alert-danger');
        } else if( restante < (presupuesto / 2)) {
            restanteDiv.classList.remove('alert-succes');
            restanteDiv.classList.add('alert-warning');
        } else { // en el caso de que el restante vuelva a ser mayor a 50% eliminamos las alertas danger y warning y agregamos las succes
            restanteDiv.classList.remove('alert-warning', 'alert-danger');
            restanteDiv.classList.add('alert-succes');
        }

        // si el restante es menor a 0
        if(restante <= 0) {
            ui.imprimirAlerta('el presupuesto se ha agotado', 'error');
            formulario.querySelector('button[type="submit"]').disabled = true;
        };
    };

    limpiarHtml() {
        while(lista.firstChild) {
            lista.removeChild(lista.firstChild);
        };
    };
};


// todo INSTANCIADOS
// creamos una variable donde vamos a tener acceso globalmente
let presupuesto;

// instanciamos el UI, lo dejamos global para poder acceder en las funciones
const ui = new UI();


// todo FUNCIONES

function preguntarPresupuesto() {
    // utilizamos la funcion de prompt para que aparezca un cartel para preguntarnos el presupesto que tiene el usuario
    const presupuestoUsuario = prompt('Cual es tu presupuesto?');

    // aca validamos si ingresa campos vacios que se recargue la pagina o si es null o si no es un numero o si es negativo
    // nos aseguramos que el presupuesto sea positivo y un numero valido
    // isNaN convierte lo ingresado a numero y si retorna NaN es true osea que no se puede convertir a numero siendo un caracter
    if(presupuestoUsuario === '' || presupuestoUsuario === null || isNaN(presupuestoUsuario) || presupuestoUsuario <= 0) { // validaciones comunes
        // en el caso de que cumpla con alguna de estas condiciones osea que este mal ingresado el presupuesto, con esta funcion recargamos la pagina y vuelve a preguntar
        window.location.reload();
    };

    // ya pasamos la validacion y llamamos a instanciar al objeto de presupuesto
    presupuesto = new Presupuesto(presupuestoUsuario);
    // console.log(presupuesto);
    ui.insertarPresupuesto(presupuesto);

    
};

// como es un submit pasa el evento automaticamente
function agregarGasto(e) {
    e.preventDefault(); // todo siempre el prevent en los submit

    // ahora vamos a leer los campos del formulario
    const nombre = document.querySelector('#gasto').value;
    const cantidad = Number(document.querySelector('#cantidad').value); // convertimos a numero el campo ingresado por el usuario asi podemos trabajar con el luego

    // vamos a validar primero que no esten vacios
    if(nombre === '' || cantidad === '') {
        ui.imprimirAlerta('Ambos campos son obligatorios', 'error');
        return; // todo para que se termine la funcion
    } else if(cantidad <= 0 || isNaN(cantidad)) { // aca vamos a mandar un mensaje diferente en este caso tiene que ser NUMERO y mayor a 0
        ui.imprimirAlerta('La cantidad tiene que ser numero mayor a 0', 'error');
        return; // todo para que se termine la funcion
    };

    // pasamos todas las validaciones
    
    // vamos a crear un objeto donde vamos a colocar los datos de los gastos
    // esto es lo contrario al destructuring, el cual le agrega o une esos campos al objeto, los campos ya estan creados como variables mas arriba
    // osea se arma el object literal pero al ser igual su key y value se pone solamente uno
    const gasto = {nombre, cantidad, id: Date.now()};
    // Date.now() da la cantidad de ms desde 1970

    // añadimos un nuevo gasto al presupuesto       
    presupuesto.nuevoGasto(gasto);

    // una vez agregamos el gasto al arreglo, imrpimimos el alerta de agregado correctamente
    ui.imprimirAlerta('Gasto agregado correctamente', 'correcto');
    

    // imprimimos los gastos en el html
    // primero extraemos el arreglo de gastos del presupuesto y tambien restante para actualizarlo en el html
    const {gastos, restante} = presupuesto;
    ui.mostrarGastos(gastos);

    // ahora actualizamos el restante en el html
    ui.actualizarRestante(restante);

    // ahora vamos a comprar el presupuesto para establecer el color del campo de restante, a medida que va quedando poco se va cambiando a color naranja y luego rojo
    ui.comprobarPresupuesto(presupuesto);

    // reiniciamos el formulario luego de cargarlo correctamente    
    formulario.reset();

};

function eliminarGasto(id) {
    // aca llamamos a eliminar gasto pero desde la clase presupuesto objeto
    presupuesto.eliminarGasto(id);

    // destructuring para sacar gastos
    const {gastos, restante} = presupuesto;

    // elimina los gastos del html
    ui.mostrarGastos(gastos);

    // ahora actualizamos el restante en el html
    ui.actualizarRestante(restante);

    // ahora vamos a comprar el presupuesto para establecer el color del campo de restante, a medida que va quedando poco se va cambiando a color naranja y luego rojo
    ui.comprobarPresupuesto(presupuesto);
}


