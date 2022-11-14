import {
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
} from '@chakra-ui/react';
import react, { useState } from 'react';

function Form() {
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');

  const handleFirstname = e => setFirstname(e.target.value);
  const handleLastname = e => setLastname(e.target.value);

  const handleClick = ()=>{
    alert(`Hello ${firstname} ${lastname}`)
    setFirstname("")
    setLastname("")
  }

//   const isError = input === '';

  return (
    <FormControl
    //   isInvalid={isError}
      w="50%"
      mx="20%"
      mt="20px"
      pt={"5px"}
      border={'2px solid #59C8FF'}
      borderRadius={'10px'}
    >
      <FormLabel htmlFor="Firstname">Firstname</FormLabel>
      <Input
        id="firstName"
        type="text"
        value={firstname}
        onChange={handleFirstname}
        mb="20px"
      />

      <FormLabel htmlFor="Lastname">Lastname</FormLabel>
      <Input
        id="lastName"
        type="text"
        value={lastname}
        onChange={handleLastname}
      />
      {/* {!isError ? (
        <FormHelperText>
          Enter the email you'd like to receive the newsletter on.
        </FormHelperText>
      ) : (
        <FormErrorMessage>Email is required.</FormErrorMessage>
      )} */}
      <Button colorScheme="blue" variant="solid" mt={"10px"} onClick={handleClick} mx={"40%"}>
        GREET ME
      </Button>
    </FormControl>
  );
}

export default Form;
