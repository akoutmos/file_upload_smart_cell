defmodule FileUploadSmartCell do
  @moduledoc """
  This LiveBook SmartCell allows you to upload files to your LiveBook
  documents and then store the file contents inside of a variable. Keep
  in mind that the entire contents of the file are stored in memory
  so this SmartCell is primarily for files less than 1 gigabyte in size.
  """

  use Kino.JS, assets_path: "lib/assets"
  use Kino.JS.Live
  use Kino.SmartCell, name: "File upload"

  @impl true
  def init(attrs, ctx) do
    ctx =
      assign(ctx,
        variable: Kino.SmartCell.prefixed_var_name("data", attrs["data"]),
        file_path: :no_file_uploaded
      )

    {:ok, ctx, reevaluate_on_change: true}
  end

  @impl true
  def handle_connect(ctx) do
    {:ok, %{variable: ctx.assigns.variable}, ctx}
  end

  @impl true
  def handle_event("file_read", {:binary, _info, file_contents}, ctx) do
    assigns = [
      file_path: process_upload(file_contents),
      variable: ctx.assigns.variable
    ]

    {:noreply, assign(ctx, assigns)}
  end

  @impl true
  def handle_event("update_variable", variable, ctx) do
    ctx =
      if Kino.SmartCell.valid_variable_name?(variable) do
        assign(ctx, variable: variable)
      else
        ctx
      end

    broadcast_event(ctx, "update_variable", ctx.assigns.variable)

    {:noreply, ctx}
  end

  @impl true
  def terminate(_reason, ctx) do
    unless ctx.assigns.file_path == :no_file_uploaded do
      File.rm!(ctx.assigns.file_path)
    end

    :ok
  end

  @impl true
  def to_attrs(ctx) do
    %{
      "variable" => ctx.assigns.variable,
      "file_path" => ctx.assigns.file_path
    }
  end

  @impl true
  def to_source(attrs) do
    quote do
      unquote(quoted_var(attrs["variable"])) =
        with file_path when is_binary(file_path) <- unquote(attrs["file_path"]),
             true <- File.exists?(file_path),
             false <- File.dir?(file_path) do
          file_contents = File.read!(file_path)
          File.rm!(file_path)
          file_contents
        else
          _ ->
            :no_file_uploaded
        end

      Kino.nothing()
    end
    |> Kino.SmartCell.quoted_to_string()
  end

  defp process_upload(file_contents) do
    temp_file_name =
      :md5
      |> :crypto.hash(file_contents)
      |> Base.encode16()

    temp_file_path =
      System.tmp_dir!()
      |> Path.join(temp_file_name)

    File.write!(temp_file_path, file_contents)

    temp_file_path
  end

  defp quoted_var(nil), do: nil
  defp quoted_var(string), do: {String.to_atom(string), [], nil}
end
