-- Agrega al pase publico solamente la identidad visual necesaria del vehiculo.
drop function if exists public.lookup_public_fidelity_card(text,text,text);

create function public.lookup_public_fidelity_card(p_token text default null,p_phone text default null,p_access_code text default null)
returns table(card_id uuid,public_token uuid,client_name text,stamps_count integer,total_stamps integer,status text,total_rewards_redeemed integer,vehicle_label text,vehicle_type text,license_plate text,activated_at timestamptz)
language plpgsql security definer set search_path=public as $$
declare
 normalized_phone text:=regexp_replace(coalesce(p_phone,''),'\D','','g');
 normalized_code text:=lower(regexp_replace(coalesce(p_access_code,''),'[^a-fA-F0-9]','','g'));
 authorized_client uuid;
begin
 if nullif(trim(coalesce(p_token,'')),'') is null then
  if normalized_phone !~ '^381[0-9]{7}$' or normalized_code !~ '^[a-f0-9]{8}$' then return; end if;
  select fc.client_id into authorized_client from public.fidelity_cards fc join public.clients c on c.id=fc.client_id
  where c.deleted_at is null and regexp_replace(c.phone,'\D','','g')=normalized_phone
   and left(replace(fc.public_token::text,'-',''),8)=normalized_code and fc.status in('active','reward_ready') limit 1;
 else
  if trim(p_token) !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then return; end if;
  select fc.client_id into authorized_client from public.fidelity_cards fc join public.clients c on c.id=fc.client_id
  where fc.public_token::text=lower(trim(p_token)) and c.deleted_at is null and fc.status in('active','reward_ready') limit 1;
 end if;
 if authorized_client is null then return; end if;
 return query select fc.id,fc.public_token,c.name::text,fc.stamps_count,fc.total_stamps,fc.status::text,fc.total_rewards_redeemed,
  coalesce(nullif(trim(concat_ws(' ',v.brand,v.model)),''),v.type,'Vehiculo')::text,v.type::text,v.license_plate::text,fc.created_at
 from public.fidelity_cards fc join public.clients c on c.id=fc.client_id and c.deleted_at is null
 left join public.vehicles v on v.id=fc.vehicle_id and v.deleted_at is null
 where fc.client_id=authorized_client and fc.status in('active','reward_ready')
 order by(fc.status='reward_ready') desc,fc.updated_at desc,fc.id;
end $$;

revoke all on function public.lookup_public_fidelity_card(text,text,text) from public;
grant execute on function public.lookup_public_fidelity_card(text,text,text) to anon,authenticated;
