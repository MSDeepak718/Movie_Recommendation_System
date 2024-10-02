import pandas as pd
import numpy as np
import sys
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

df1 = pd.read_csv(os.path.join(BASE_DIR,'tmdb_5000_credits.csv'))
df2 = pd.read_csv(os.path.join(BASE_DIR,'movies.csv'))


df1.columns = ['id', 'tittle', 'cast', 'crew']
df2 = df2.merge(df1, on='id')

C = df2['vote_average'].mean()
m = df2['vote_count'].quantile(0.9)

def weighted_rating(x, m=m, C=C):
    v = x['vote_count']
    R = x['vote_average']
    return (v / (v + m) * R) + (m / (m + v) * C)

if len(sys.argv) > 1:
    genre = sys.argv[1]
else:
    print("Please provide a genre.")
    sys.exit(1)

genre_movies = df2[df2['genres'].apply(lambda x: genre in [i for i in eval(x)])]
genre_movies = genre_movies[genre_movies['vote_count'] >= m]
genre_movies['score'] = genre_movies.apply(weighted_rating, axis=1)
genre_movies = genre_movies.sort_values('score', ascending=False)
top_movies = genre_movies[['title']].head(20)

for title in top_movies['title']:
    print(title)
