let listener = null;

export const setIncomingRequestListener = (fn) => {
  listener = fn;

  return () => {
    if (listener === fn) listener = null;
  };
};

export const showIncomingRequest = (trip) => {
  if (!trip || !listener) return;
  listener(trip);
};
