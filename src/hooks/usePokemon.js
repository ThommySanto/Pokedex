import { useEffect, useState } from "react";
import { fetchPokemon, fetchPokemonIdsByType, fetchPokemonList } from "../api/pokeapi.js";

export function usePokemonList() {
  const [list, setList] = useState([]);
  const [error, setError] = useState(null);
  useEffect(() => {
    fetchPokemonList().then(setList).catch(setError);
  }, []);
  return { list, error };
}

export function usePokemon(id) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  useEffect(() => {
    let active = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    fetchPokemon(id)
      .then((data) => active && setState({ data, loading: false, error: null }))
      .catch((error) => active && setState({ data: null, loading: false, error }));
    return () => { active = false; };
  }, [id]);
  return state;
}

// Restituisce gli id dell'elemento scelto (null finché non sono pronti)
export function useTypeIds(type) {
  const [state, setState] = useState({ type: null, ids: null });
  useEffect(() => {
    if (!type) return;
    let active = true;
    fetchPokemonIdsByType(type)
      .then((ids) => active && setState({ type, ids }))
      .catch(() => active && setState({ type, ids: new Set() }));
    return () => { active = false; };
  }, [type]);
  const ids = type && state.type === type ? state.ids : null;
  return { ids, loading: Boolean(type) && !ids };
}
