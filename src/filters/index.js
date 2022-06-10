function nulltext(value, nullText = "--") {
  return value == null || value === "" ? nullText : value;
}

export { nulltext };
