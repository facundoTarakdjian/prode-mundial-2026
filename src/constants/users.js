export const USERS = [
  { username: 'Marcelo', password: 'Marcelo7341', isAdmin: false },
  { username: 'Ricardo', password: 'Ricardo9182', isAdmin: false },
  { username: 'Fran',    password: 'Fran4857',    isAdmin: false },
  { username: 'Chechu', password: 'Chechu2619',   isAdmin: true  },
  { username: 'Nacho',  password: 'Nacho5073',    isAdmin: false },
]

export const ALL_USERNAMES = USERS.map(u => u.username)
