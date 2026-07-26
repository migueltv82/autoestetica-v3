-- Aplica un descuento al turno y, durante el alta, ajusta también el cobro inicial y Caja.
create or replace function public.set_work_order_discount(
  p_order_id uuid,
  p_discount numeric,
  p_adjust_initial_payment boolean default false
)
returns numeric
language plpgsql
security definer
set search_path = public
as $$
declare
  target_org uuid := public.current_organization_id();
  order_total numeric;
begin
  if target_org is null then raise exception 'Sesión sin organización'; end if;

  update public.work_orders
  set discount = least(greatest(coalesce(p_discount, 0), 0), subtotal)
  where id = p_order_id and organization_id = target_org and deleted_at is null
  returning total into order_total;

  if order_total is null then raise exception 'Turno no encontrado'; end if;

  if p_adjust_initial_payment then
    update public.payments
    set amount = order_total
    where work_order_id = p_order_id and organization_id = target_org
      and voided_at is null and kind = 'payment';

    update public.cash_movements cm
    set amount = order_total
    where cm.work_order_id = p_order_id and cm.organization_id = target_org
      and cm.voided_at is null and cm.type = 'income';
  end if;

  return order_total;
end $$;

revoke all on function public.set_work_order_discount(uuid,numeric,boolean) from public;
grant execute on function public.set_work_order_discount(uuid,numeric,boolean) to authenticated;
