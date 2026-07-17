import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";
export function useSubscription(){const{organizationId}=useAuth();const[subscription,setSubscription]=useState(null);const[usage,setUsage]=useState({users:0,clients:0,monthlyOrders:0});const[isLoading,setIsLoading]=useState(true);const refresh=useCallback(async()=>{if(!organizationId)return;setIsLoading(true);const[s,u]=await Promise.all([supabase.from("organization_subscriptions").select("status,trial_ends_at,current_period_ends_at,cancel_at_period_end,plans(code,name,description,limits,features)").eq("organization_id",organizationId).maybeSingle(),supabase.rpc("current_usage")]);if(!s.error)setSubscription(s.data);if(!u.error&&u.data)setUsage(u.data);setIsLoading(false)},[organizationId]);useEffect(()=>{const timer=setTimeout(refresh,0);return()=>clearTimeout(timer)},[refresh]);return{subscription,usage,isLoading,refresh}}

