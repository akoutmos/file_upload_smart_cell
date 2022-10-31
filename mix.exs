defmodule FileUploadSmartCell.MixProject do
  use Mix.Project

  def project do
    [
      app: :file_upload_smart_cell,
      version: "0.1.0",
      elixir: "~> 1.14",
      start_permanent: Mix.env() == :prod,
      deps: deps()
    ]
  end

  # Run "mix help compile.app" to learn about applications.
  def application do
    [
      mod: {FileUploadSmartCell.Application, []},
      extra_applications: [:logger]
    ]
  end

  # Run "mix help deps" to learn about dependencies.
  defp deps do
    [
      {:kino, "0.7.0"}
    ]
  end
end
