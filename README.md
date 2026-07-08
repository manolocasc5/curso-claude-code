# Kōhi — Lista de espera

Backend y frontend de la lista de espera para Kōhi, una cafetería de especialidad. Los visitantes se registran, reciben una posición en la cola y pueden iniciar sesión para consultarla.

## Stack

- **Backend:** Node.js + Express 5
- **Base de datos:** SQLite (`better-sqlite3`)
- **Auth:** JWT (`jsonwebtoken`) + contraseñas con `bcrypt`
- **Frontend:** HTML/CSS estático servido desde `public/`
- **Tests:** Jest

## Estructura

```
server.js                      Punto de entrada Express
db.js                          Conexión a SQLite (kohi.db)
routes/api.js                  Endpoints /api/register, /api/login, /api/me
middleware/auth.js             Middleware de verificación de JWT
src/validators/emailValidator.js   Validación de formato de email
tests/validators/               Tests Jest de los validadores
public/                        index, register, login y dashboard (HTML/CSS)
```

## Configuración

Crea un archivo `.env` en la raíz con:

```
PORT=3000
JWT_SECRET=<secreto-para-firmar-los-tokens>
```

La base de datos (`kohi.db`) debe existir con una tabla `waitlist`:

```sql
CREATE TABLE waitlist (
  id            INTEGER PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  position      INTEGER,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Uso

```bash
npm install
npm start
```

El servidor arranca en `http://localhost:3000` y sirve tanto la API (`/api`) como el frontend estático.

### Endpoints

| Método | Ruta            | Auth   | Descripción                                  |
|--------|-----------------|--------|-----------------------------------------------|
| POST   | `/api/register` | No     | Crea un registro y devuelve la posición en la lista |
| POST   | `/api/login`    | No     | Valida credenciales y devuelve un JWT        |
| GET    | `/api/me`       | Bearer | Devuelve nombre, email, posición y total de inscritos |

El registro valida el formato del email (rechaza casos como `usuario@.com`) y exige `name`, `email` y `password`.

## Tests

```bash
npx jest
```
