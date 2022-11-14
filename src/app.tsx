import { BrowserRouter, Routes, Route } from "react-router-dom"
import { ChakraProvider } from "@chakra-ui/provider"
import theme from "./theme/index"
import Form from './pages/Form';
import { readDir, FileEntry, readTextFile } from "@tauri-apps/api/fs"

// if (is_osx) view.windowBlurbehind = #light;
// stdout.println("current platform:", OS);
// stdout.println("is_xfce: ", is_xfce);

// // html min-width, min-height not working on mac, below works for all
// view.windowMinSize = (scaleIt(560), scaleIt(300));

const App = () => {
    return (
      <BrowserRouter>
        <ChakraProvider theme={theme}>
          <Routes>
            <Route index element={<Form />} />
          </Routes>
        </ChakraProvider>
  
      </BrowserRouter>
    )
  }
  
  export default App
  