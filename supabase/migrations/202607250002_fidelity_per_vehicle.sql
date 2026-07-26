-- Una tarjeta Fidelity independiente por vehículo.
alter table public.fidelity_cards
  add column if not exists vehicle_id uuid references public.vehicles(id) on delete cascade;

-- Conserva el progreso existente asociándolo al vehículo usado más recientemente.
update public.fidelity_cards fc
set vehicle_id = (
  select v.id
  from public.vehicles v
  where v.client_id = fc.client_id and v.deleted_at is null
  order by v.updated_at desc, v.created_at desc
  limit 1
)
where fc.vehicle_id is null;

drop index if exists public.fidelity_cards_one_current_per_client;
create unique index if not exists fidelity_cards_one_current_per_vehicle
on public.fidelity_cards(vehicle_id) where status in ('active','reward_ready') and vehicle_id is not null;
create index if not exists fidelity_cards_client_vehicle_idx
on public.fidelity_cards(client_id, vehicle_id, status);

-- Impide asociar una tarjeta a un vehículo perteneciente a otro cliente.
create or replace function public.validate_fidelity_card_vehicle() returns trigger
language plpgsql set search_path = public as $$
begin
  if new.vehicle_id is not null and not exists (
    select 1 from public.vehicles v
    where v.id = new.vehicle_id and v.client_id = new.client_id and v.deleted_at is null
  ) then
    raise exception 'El vehículo no pertenece al cliente de la tarjeta';
  end if;
  return new;
end $$;

drop trigger if exists validate_fidelity_card_vehicle on public.fidelity_cards;
create trigger validate_fidelity_card_vehicle
before insert or update of client_id, vehicle_id on public.fidelity_cards
for each row execute function public.validate_fidelity_card_vehicle();
