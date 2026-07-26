-- Migración: Actualizar lookup_fidelity_card_by_phone para incluir datos del vehículo
-- Agrega vehicle_label (marca + modelo) y total_rewards_redeemed a la respuesta pública.
-- Se debe dropar primero porque cambia la firma de retorno (no compatible con CREATE OR REPLACE).

drop function if exists public.lookup_fidelity_card_by_phone(text);

create function public.lookup_fidelity_card_by_phone(p_phone text)
returns table(
  client_name            text,
  stamps_count           integer,
  total_stamps           integer,
  status                 text,
  total_rewards_redeemed integer,
  vehicle_label          text
)
language plpgsql security definer set search_path = public as $$
declare
  normalized_phone text;
begin
  normalized_phone := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');
  if normalized_phone !~ '^381[0-9]{7}$' then return; end if;

  return query
    select
      c.name::text                                                        as client_name,
      fc.stamps_count                                                     as stamps_count,
      fc.total_stamps                                                     as total_stamps,
      fc.status::text                                                     as status,
      fc.total_rewards_redeemed                                           as total_rewards_redeemed,
      -- Último vehículo activo del cliente (marca + modelo)
      (
        select trim(concat(coalesce(v2.brand, ''), ' ', coalesce(v2.model, '')))
        from public.vehicles v2
        where v2.client_id = c.id
          and v2.deleted_at is null
        order by v2.updated_at desc
        limit 1
      )::text                                                             as vehicle_label
    from public.clients c
    join public.fidelity_cards fc on fc.client_id = c.id
    where c.phone = normalized_phone
      and c.deleted_at is null
      and fc.status in ('active', 'reward_ready')
    order by fc.updated_at desc
    limit 1;
end $$;

revoke all    on function public.lookup_fidelity_card_by_phone(text) from public;
grant execute on function public.lookup_fidelity_card_by_phone(text) to anon, authenticated;
