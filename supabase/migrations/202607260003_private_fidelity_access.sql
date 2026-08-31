-- [PRIVACIDAD] Reemplaza la consulta pública por teléfono por un enlace secreto por tarjeta.

alter table public.fidelity_cards
  add column if not exists public_token uuid not null default gen_random_uuid();
create unique index if not exists fidelity_cards_public_token_key
  on public.fidelity_cards(public_token);

drop function if exists public.lookup_fidelity_card_by_phone(text);

create or replace function public.lookup_public_fidelity_card(
  p_token text default null,
  p_phone text default null,
  p_access_code text default null
)
returns table(
  client_name text,
  stamps_count integer,
  total_stamps integer,
  status text,
  total_rewards_redeemed integer,
  vehicle_label text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_phone text := regexp_replace(coalesce(p_phone,''),'\D','','g');
  normalized_code text := lower(regexp_replace(coalesce(p_access_code,''),'[^a-fA-F0-9]','','g'));
begin
  if nullif(trim(coalesce(p_token,'')),'') is null then
    if normalized_phone !~ '^381[0-9]{7}$' or normalized_code !~ '^[a-f0-9]{8}$' then return; end if;
  elsif trim(p_token) !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then
    return;
  end if;

  return query
  select c.name::text,fc.stamps_count,fc.total_stamps,fc.status::text,
    fc.total_rewards_redeemed,
    trim(concat(coalesce(v.brand,''),' ',coalesce(v.model,'')))::text
  from public.fidelity_cards fc
  join public.clients c on c.id=fc.client_id
  left join public.vehicles v on v.id=fc.vehicle_id and v.deleted_at is null
  where c.deleted_at is null and fc.status in ('active','reward_ready')
    and (
      (nullif(trim(coalesce(p_token,'')),'') is not null and fc.public_token::text=lower(trim(p_token)))
      or
      (nullif(trim(coalesce(p_token,'')),'') is null
        and regexp_replace(c.phone,'\D','','g')=normalized_phone
        and left(replace(fc.public_token::text,'-',''),8)=normalized_code)
    )
  limit 1;
end $$;

revoke all on function public.lookup_public_fidelity_card(text,text,text) from public;
grant execute on function public.lookup_public_fidelity_card(text,text,text) to anon,authenticated;
