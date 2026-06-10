import axios from 'axios';
async function main() {
  try {
    const response = await axios.get('http://localhost:4000/api/sales', {
      headers: { Authorization: 'Bearer test' } // This will fail auth, but I want to see if it even works
    });
    console.log(response.data);
  } catch (e: any) {
    console.log('Status:', e.response?.status);
    console.log('Data:', e.response?.data);
  }
}
main();
