export function init(ctx, payload) {
  ctx.importCSS('main.css')
  ctx.importCSS('https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap')

  root.innerHTML = `
    <div class="app">
      <div class="input-row">
        <div>
          <label class="label">Assign contents to</label>
          <input class="input" type="text" name="variable" />
        </div>

        <div style="margin-left: 25px;">
          <label class="label">Last upload</label>
          <input class="input" type="text" name="file_name" style="opacity: 0.75; cursor: not-allowed;" disabled />
        </div>

        <div style="margin-left: 25px;">
          <label class="label">Write to</label>
          <button id="storage-method" class="storage-toggle">Disk</button>
        </div>
      </div>

      <div id="drop-zone" class="idle">
        <svg class="file-upload-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 7.5h-.75A2.25 2.25 0 004.5 9.75v7.5a2.25 2.25 0 002.25 2.25h7.5a2.25 2.25 0 002.25-2.25v-7.5a2.25 2.25 0 00-2.25-2.25h-.75m-6 3.75l3 3m0 0l3-3m-3 3V1.5m6 9h.75a2.25 2.25 0 012.25 2.25v7.5a2.25 2.25 0 01-2.25 2.25h-7.5a2.25 2.25 0 01-2.25-2.25v-.75" />
        </svg>

        <form>
          <div class="file-upload-text">
            <label for="file-upload" class="upload-button">
              <span>Upload a file</span>
              <input id="file-upload" name="file-upload" type="file" class="sr-only" />
            </label>

            <span style="margin-left: 1px;">or drag and drop</span>
          </div>
        </form>
      </div>
    </div>
  `

  let hoverStateRef = null

  const variableEl = ctx.root.querySelector(`input[name="variable"]`)
  variableEl.value = payload.variable

  variableEl.addEventListener('change', (event) => {
    ctx.pushEvent('update_variable', event.target.value)
  })

  ctx.handleEvent('update_variable', (variable) => {
    variableEl.value = variable
  })

  const storageMethodEl = ctx.root.querySelector(`#storage-method`)
  storageMethodEl.addEventListener('click', (event) => {
    if (storageMethodEl.innerText == 'Disk') {
      storageMethodEl.innerText = 'Memory'
    } else {
      storageMethodEl.innerText = 'Disk'
    }
  })

  const fileNameEl = ctx.root.querySelector(`input[name="file_name"]`)
  fileNameEl.value = 'No file uploaded'

  const fileUploadEl = ctx.root.querySelector(`input[name="file-upload"]`)
  fileUploadEl.onchange = () => {
    const file = fileUploadEl.files[0]
    let fr = new FileReader()
    fr.readAsArrayBuffer(file)

    fr.onload = () => {
      let metadata = {
        file_name: file.name,
        storage: storageMethodEl.innerText.toLowerCase()
      }

      fileNameEl.value = file.name
      ctx.pushEvent('file_read', [metadata, fr.result])
    }
  }

  const fileInput = ctx.root.querySelector(`#drop-zone`)
  fileInput.addEventListener('drop', (event) => {
    // Prevent default behavior (prevent file from being opened)
    event.preventDefault()

    if (hoverStateRef) {
      clearTimeout(hoverStateRef)
    }

    fileInput.classList.add('idle')
    fileInput.classList.remove('hover')

    if (event.dataTransfer.items) {
      let item = event.dataTransfer.items[0]

      // If dropped items aren't files, reject them
      if (item.kind === 'file') {
        const file = item.getAsFile()
        let fr = new FileReader()
        fr.readAsArrayBuffer(file)

        let metadata = {
          file_name: file.name,
          storage: storageMethodEl.innerText.toLowerCase()
        }

        fr.onload = () => {
          fileNameEl.value = file.name
          ctx.pushEvent('file_read', [metadata, fr.result])
        }
      }
    }
  })

  fileInput.addEventListener('dragover', (event) => {
    fileInput.classList.add('hover')

    if (hoverStateRef) {
      clearTimeout(hoverStateRef)
    }

    hoverStateRef = setTimeout(() => {
      fileInput.classList.add('idle')
      fileInput.classList.remove('hover')
    }, 100)

    // Prevent default behavior (Prevent file from being opened)
    event.preventDefault()
  })
}
