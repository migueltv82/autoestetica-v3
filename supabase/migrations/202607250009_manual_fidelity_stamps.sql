create or replace function public.set_fidelity_card_stamps(p_card_id uuid,p_stamps integer)
returns public.fidelity_cards
language plpgsql
security definer
set search_path=public
as $$
declare target_org uuid:=public.current_organization_id(); target_count integer:=greatest(0,least(coalesce(p_stamps,0),4)); result public.fidelity_cards;
begin
 if target_org is null then raise exception 'Sesión sin organización'; end if;
 if not public.current_user_has_role(array['owner','admin']) then raise exception 'No tenés permiso para editar troqueles' using errcode='42501'; end if;
 update public.fidelity_cards fc
 set stamps_count=target_count,status=case when target_count>=4 then 'reward_ready' else 'active' end,updated_at=now()
 where fc.id=p_card_id and exists(select 1 from public.clients c where c.id=fc.client_id and c.organization_id=target_org)
 returning fc.* into result;
 if result.id is null then raise exception 'Tarjeta Fidelity no encontrada'; end if;
 return result;
end $$;
revoke all on function public.set_fidelity_card_stamps(uuid,integer) from public;
grant execute on function public.set_fidelity_card_stamps(uuid,integer) to authenticated;
