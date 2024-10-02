import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
import sys
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

df1 = pd.read_csv(os.path.join(BASE_DIR,  'ratings.csv'))
df2 = pd.read_csv(os.path.join(BASE_DIR, 'movies.csv'))

def clean_ratings(df):
    df['rating'] = pd.to_numeric(df['rating'], errors='coerce')
    df.dropna(subset=['rating'], inplace=True)
    df['uid'] = df['uid'].astype(int)
    df['mid'] = df['mid'].astype(int)
    return df

def get_similar_movies(movie_title, num_recommendations=5):
    ratings = clean_ratings(df1)
    user_item_matrix = ratings.pivot_table(index='uid', columns='mid', values='rating').fillna(0)
    item_similarity = cosine_similarity(user_item_matrix.T)
    item_similarity_df = pd.DataFrame(item_similarity, index=user_item_matrix.columns, columns=user_item_matrix.columns)
    
    movie_id = df2[df2['title'].str.contains(movie_title, case=False, na=False)]['id'].values
    if len(movie_id) == 0:
        print(f"No movie found with the title: {movie_title}")
        return []
    
    movie_id = movie_id[0]
    if movie_id not in item_similarity_df.index:
        print(f"No ratings found for movie ID {movie_id}.")
        return []
    
    similar_movies = item_similarity_df[movie_id].sort_values(ascending=False).head(num_recommendations + 1).index.tolist()
    similar_movie_ids = similar_movies[1:]  
    return similar_movie_ids

def get_movie_names(movie_ids):
    movie_names = df2[df2['id'].isin(movie_ids)][['id', 'title']]
    return movie_names.set_index('id')['title'].to_dict()

if __name__ == "__main__":
    if len(sys.argv) > 1:
        movie_title = sys.argv[1]
        num_recommendations = int(sys.argv[2]) if len(sys.argv) > 2 else 15
        recommendations = get_similar_movies(movie_title, num_recommendations)
        if recommendations:
            movie_titles = get_movie_names(recommendations)
            for movie_id in recommendations:
                print(f"{movie_titles.get(movie_id, 'Unknown Movie')}")
        else:
            print("No recommendations found.")
    else:
        print("No movie title provided.")
