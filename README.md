This repo is a clone of the original repo along with a bunch of changes to finish both tasks. A common codebase was used to finish both, as the wordpress frontend was added to the same docker compose file

How to run these services?

Clone these files locally and run 

```
docker compose up -d
```

and then follow it up with

```
docker compose restart wordpress
```
This ensures that the wordpress frontend connects with the database set up. 

There is another folder that contains the assumptions file along with the files for each task separately. 
