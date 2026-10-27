To run the Project locally 
1)Open the terminal and paste 


cd backend
npm install
Copy-Item .env.example .env
npm run dev


2)For frontend open new terminal and paste 

cd sustainx-react
npm install
npm run dev

3)EcoBot needs an extra step: install Ollama and download the configured gemma3:1b model. Without that, the rest of the app may run, but EcoBot chat won’t. So install these required package to run EcoBot locally,
