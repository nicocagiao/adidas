
# Ar-Adidas

Este proyecto consulta la API de Adidas (AR) y te envía un whastapp si registra que un producto cambió de precio o de descuento.

Además, genera una API nueva, con menos datos, para consumir.




## Como instalar y usar


```bash
  git clone https://github.com/nicocagiao/ar-adidas.git
```

```bash
  npm install
```

```bash
  node app.js
```

`node app.js` inicia el servidor en localhost:3000 y comienza el fetch a la API de Adidas (Arg).

Whatsapp-web.js genera un código QR que hay que escanear con el celular y vincular el dipositivo.

Esto hace arrancar un cliente de whatsapp que debe estar activo todo el tiempo para poder enviar mensajes.

## Variables de ambiente

Para correr el proyecto se necesita un archivo `.env` con las siguientes variables - Hay un archivo de ejemplo llamado `.env.example`

`BASE_URL=` url de la API

`QUERY=` acá van un string con los productos (zapatillas, ropa, accesorios)

`BATCH_SIZE=` la api proporciona objetos de 48 items por vez

`TOTAL_ITEMS=` el total de items por producto

`DATABASE_FILE=` el nombre de la base de datos 'products.db'

`VENOM_SESSION_NAME=sessionName`

`WHATSAPP_NUMBER=whatsapp:elnúmerodewhatsapp`

`PUPPETEER_USER_AGENT=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36`

`SERVER_PORT=3000`


## Así se ve la API en http://localhost:3000/api 

![App Screenshot](https://github.com/nicocagiao/ar-adidas/blob/main/apiscreenshot.png)


## A Terminar
 
- optimizar las actions.js de puppeteer para que haga API calls simultáneas (ver límite de API y evitar ser bloqueado por Adidas) - Además, el fetch se hace uno por uno para que no sobrecargue tanto el CPU y la memoria.

- Como implementar caching para no tener que hacer request a la API y solo hacerla cuando hay un cambio

