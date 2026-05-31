function Para(el)
  if #el.content == 1 and el.content[1].t == "Str" and el.content[1].text == "\\newpage" then
    return { pandoc.RawBlock("latex", "\\newpage") }
  end
  return nil
end
