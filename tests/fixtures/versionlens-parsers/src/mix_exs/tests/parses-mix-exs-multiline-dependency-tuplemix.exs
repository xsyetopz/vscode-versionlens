defmodule Demo.MixProject do
  defp deps do
    [
      {:gettext,
       git: "https://github.com/elixir-lang/gettext.git",
       tag: "0.26.2"}
    ]
  end
end
