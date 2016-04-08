create table public.users (
    id serial primary key,
    created timestamp not null default now(),
    email varchar(32) not null,
    password varchar(32) not null,
    firstname varchar(32) not null,
    lastname varchar(32) not null,
    about text
);

create table public.places (
    id serial primary key,
    created timestamp not null default now(),
    name varchar(256) not null,
    address varchar(256) not null,
    position point not null
);

create table public.articles (
    id serial primary key,
    user_id integer not null references users (id) on update cascade on delete cascade,
    place_id integer not null references places (id) on update cascade on delete cascade,
    created timestamp not null default now(),
    title varchar(256) not null,
    lead text not null,
    body text not null
);