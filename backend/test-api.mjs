async function test() {
  const loginRes = await fetch('http://localhost:8080/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: `test_${Date.now()}@test.com`, password: 'password123' })
  });
  const data = await loginRes.json();
  if (!data.token) {
    console.error("Register failed:", data);
    return;
  }
  
  const token = data.token;
  console.log("Got token.");
  
  const reqRes = await fetch('http://localhost:8080/products', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      categoryId: "b081d2df-8eb3-439d-8afd-6f95a9556c86",
      name: "program",
      description: "desc",
      price: 1234
    })
  });
  
  const text = await reqRes.text();
  console.log("Response:", reqRes.status, text);
}
test();
