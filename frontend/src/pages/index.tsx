import axios from 'axios';

const Home = () => {

  const gihtub = () => {
    window.open(process.env.NEXT_PUBLIC_REDIRECT_URI, "_self")
  }

  const logout = () => {
    // const config = {
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   withCredentials: true,
    // };
    // axios.get(process.env.NEXT_PUBLIC_LOGOUT_URI as string, config)
    //   .then((res: any) => {
    //     console.log(res);
    //     window.location.href = '/';
    //   })
    //   .catch((err: any) => {
    //     console.log(err);
    //   });
    window.open(process.env.NEXT_PUBLIC_LOGOUT_URI as string, "_self");
  };

  
  return (
    <div className="h-screen w-screen flex justify-center items-center">
      <div>
        <button onClick={gihtub} className="bg-gray-600 text-white py-4 px-12 shadow-lg rounded-lg">Login</button>
      </div>
      <div>
        <button onClick={logout} className="bg-gray-600 text-white py-4 px-12 shadow-lg rounded-lg">Logout</button>
      </div>
    </div>
  );
}

export default Home;