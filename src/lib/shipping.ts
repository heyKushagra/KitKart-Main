export const calculateShippingCharge = (subtotal: number): number => {
  if (subtotal <= 0) return 0;
  return subtotal <= 399 ? 49 : 0;
};
