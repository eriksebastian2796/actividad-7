//archivo de configuracin para multer que almacena los archivos en la ram
import multer from 'multer';

// memoryStorage obtiene el buffer binario directamente
const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

export default upload;