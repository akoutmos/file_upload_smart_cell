defmodule FileUploadSmartCell.Application do
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    Kino.SmartCell.register(FileUploadSmartCell)

    children = []
    opts = [strategy: :one_for_one, name: FileUploadSmartCell.Supervisor]

    Supervisor.start_link(children, opts)
  end
end
