-- Precios diferenciados por tipo de vehiculo y servicios sujetos a evaluacion.
alter table public.services add column if not exists car_price numeric(12,2) check (car_price >= 0);
alter table public.services add column if not exists truck_price numeric(12,2) check (truck_price >= 0);
alter table public.services add column if not exists price_on_request boolean not null default false;

update public.services
set car_price = coalesce(car_price, base_price),
    truck_price = coalesce(truck_price, base_price)
where car_price is null or truck_price is null;
